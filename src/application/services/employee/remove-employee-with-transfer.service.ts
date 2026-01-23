import { ActionMovement } from '@/core/domain/action';
import { ActionStatus, CompanyUserStatus } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface PrismaTransactionClient {
  team: {
    findMany: (args: {
      where: { companyId: string };
      select: { id: true };
    }) => Promise<Array<{ id: string }>>;
  };
  teamUser: {
    deleteMany: (args: {
      where: {
        userId: string;
        teamId: { in: string[] };
      };
    }) => Promise<{ count: number }>;
  };
}

export interface RemoveEmployeeWithTransferInput {
  companyUserId: string;
  newResponsibleId: string;
  currentUserId: string; // Quem está executando a operação
}

export interface ActionTransferred {
  id: string;
  title: string;
  status: ActionStatus;
}

export interface UserSummary {
  id: string;
  name: string;
}

export interface RemoveEmployeeWithTransferOutput {
  success: boolean;
  message: string;
  summary: {
    employeeRemoved: UserSummary;
    newResponsible: UserSummary;
    actionsTransferred: number;
    teamsRemovedFrom: number;
    actionDetails: ActionTransferred[];
  };
}

@Injectable()
export class RemoveEmployeeWithTransferService {
  constructor(
    @Inject('TransactionManager')
    private readonly transactionManager: TransactionManager,
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('ActionMovementRepository')
    private readonly actionMovementRepository: ActionMovementRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    input: RemoveEmployeeWithTransferInput,
  ): Promise<RemoveEmployeeWithTransferOutput> {
    // Validações iniciais fora da transação
    const companyUser = await this.companyUserRepository.findById(
      input.companyUserId,
    );

    if (!companyUser) {
      throw new EntityNotFoundException('Funcionário', input.companyUserId);
    }

    // Funcionários apenas convidados não podem ser removidos com transferência
    if (companyUser.isInvited()) {
      throw new DomainValidationException(
        'Funcionários convidados não podem ter ações transferidas. Cancele o convite.',
      );
    }

    if (!companyUser.canBeRemoved()) {
      throw new DomainValidationException(
        'Este funcionário não pode ser removido',
      );
    }

    // Validar novo responsável
    const newResponsibleCompanyUser =
      await this.companyUserRepository.findByCompanyAndUser(
        companyUser.companyId,
        input.newResponsibleId,
      );

    if (!newResponsibleCompanyUser) {
      throw new EntityNotFoundException(
        'Novo responsável',
        input.newResponsibleId,
      );
    }

    if (newResponsibleCompanyUser.status !== CompanyUserStatus.ACTIVE) {
      throw new DomainValidationException(
        'O novo responsável deve estar ativo na empresa',
      );
    }

    if (companyUser.userId === input.newResponsibleId) {
      throw new DomainValidationException(
        'O novo responsável não pode ser o mesmo funcionário sendo removido',
      );
    }

    // Buscar usuários para os nomes
    const employeeUser = await this.userRepository.findById(companyUser.userId);
    const newResponsibleUser = await this.userRepository.findById(
      input.newResponsibleId,
    );

    if (!employeeUser || !newResponsibleUser) {
      throw new EntityNotFoundException('Usuário', 'não encontrado');
    }

    // Executar operação em transação
    const result = await this.transactionManager.execute(async (tx) => {
      // 1. Buscar ações pendentes do colaborador
      const pendingActions = await this.actionRepository.findByResponsibleId(
        companyUser.userId,
        {
          status: [ActionStatus.TODO, ActionStatus.IN_PROGRESS],
          includeDeleted: false,
        },
        tx,
      );

      const actionDetails: ActionTransferred[] = [];

      // 2. Transferir cada ação e criar movimento de auditoria
      for (const action of pendingActions) {
        // Atualizar responsável da ação
        await this.actionRepository.update(
          action.id,
          {
            responsibleId: input.newResponsibleId,
          },
          tx,
        );

        // Criar movimento de auditoria
        const movement = new ActionMovement(
          randomUUID(),
          action.id,
          action.status,
          action.status, // Status não muda
          input.currentUserId,
          new Date(),
          `Ação transferida automaticamente devido à saída do colaborador ${employeeUser.firstName} ${employeeUser.lastName}`,
          null,
        );

        await this.actionMovementRepository.create(movement, tx);

        actionDetails.push({
          id: action.id,
          title: action.title,
          status: action.status,
        });
      }

      // 3. Remover usuário de todos os times da empresa
      // Primeiro, buscar todos os times da empresa
      const prismaTx = tx as PrismaTransactionClient;
      const companyTeams = await prismaTx.team.findMany({
        where: {
          companyId: companyUser.companyId,
        },
        select: { id: true },
      });

      const companyTeamIds = companyTeams.map((team) => team.id);

      // Deletar todas as memberships do usuário nesses times
      const deleteResult = await prismaTx.teamUser.deleteMany({
        where: {
          userId: companyUser.userId,
          teamId: {
            in: companyTeamIds,
          },
        },
      });

      const teamsRemovedFrom = deleteResult.count;

      // 5. Atualizar status do colaborador
      await this.companyUserRepository.update(
        companyUser.id,
        {
          status: CompanyUserStatus.REMOVED,
        },
        tx,
      );

      return {
        actionsTransferred: pendingActions.length,
        teamsRemovedFrom,
        actionDetails,
      };
    });

    return {
      success: true,
      message: 'Colaborador removido com sucesso',
      summary: {
        employeeRemoved: {
          id: employeeUser.id,
          name: `${employeeUser.firstName} ${employeeUser.lastName}`,
        },
        newResponsible: {
          id: newResponsibleUser.id,
          name: `${newResponsibleUser.firstName} ${newResponsibleUser.lastName}`,
        },
        actionsTransferred: result.actionsTransferred,
        teamsRemovedFrom: result.teamsRemovedFrom,
        actionDetails: result.actionDetails,
      },
    };
  }
}

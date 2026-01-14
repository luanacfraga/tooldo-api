import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { ActionStatus, UserRole } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ChangeEmployeeRoleInput {
  companyUserId: string;
  newRole: UserRole;
  requestingUserId: string;
}

export interface ChangeEmployeeRoleOutput {
  companyUser: CompanyUser;
}

@Injectable()
export class ChangeEmployeeRoleService {
  constructor(
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  async execute(
    input: ChangeEmployeeRoleInput,
  ): Promise<ChangeEmployeeRoleOutput> {
    // 1. Buscar o funcionário (companyUser)
    const companyUser = await this.companyUserRepository.findById(
      input.companyUserId,
    );

    if (!companyUser) {
      throw new EntityNotFoundException('Funcionário', input.companyUserId);
    }

    // 2. Validar que o funcionário está ACTIVE
    if (!companyUser.isActive()) {
      throw new DomainValidationException('Funcionário não está ativo');
    }

    // 3. Validar que o novo cargo é diferente do atual
    if (companyUser.role === input.newRole) {
      throw new DomainValidationException(
        'O novo cargo deve ser diferente do cargo atual',
      );
    }

    // 4. Se está deixando de ser gestor, garantir que não é gestor de nenhuma equipe desta empresa
    if (
      companyUser.role === UserRole.MANAGER &&
      input.newRole !== UserRole.MANAGER
    ) {
      const teamsWhereIsManager = await this.teamRepository.findByManagerId(
        companyUser.userId,
      );

      const teamsInSameCompany = teamsWhereIsManager.filter(
        (team) => team.companyId === companyUser.companyId,
      );

      if (teamsInSameCompany.length > 0) {
        throw new DomainValidationException(
          'Não é possível mudar o cargo. O usuário é gestor de uma ou mais equipes. Transfira a gestão dessas equipes para outro gestor antes de mudar o cargo.',
        );
      }
    }

    // 5. Validar que o funcionário não tem ações pendentes (TODO) ou em andamento (IN_PROGRESS)
    const pendingTodo = await this.actionRepository.findByResponsibleId(
      companyUser.userId,
      { status: ActionStatus.TODO },
    );

    const pendingInProgress = await this.actionRepository.findByResponsibleId(
      companyUser.userId,
      { status: ActionStatus.IN_PROGRESS },
    );

    const pendingActions = [...pendingTodo, ...pendingInProgress];

    if (pendingActions.length > 0) {
      const count = pendingActions.length;
      const suffix = count >= 50 ? '+' : '';
      const displayCount = count >= 50 ? 50 : count;

      throw new DomainValidationException(
        `Não é possível mudar o cargo. O funcionário possui ${displayCount}${suffix} ações pendentes ou em andamento.`,
      );
    }

    // 6. Atualizar vínculos de equipe conforme o novo cargo
    // - Se virar manager ou consultant, não deve mais ser executor em nenhuma equipe
    if (
      input.newRole === UserRole.MANAGER ||
      input.newRole === UserRole.CONSULTANT
    ) {
      const existingTeamUser = await this.teamUserRepository.findByUserId(
        companyUser.userId,
      );

      if (existingTeamUser) {
        await this.teamUserRepository.delete(existingTeamUser.id);
      }
    }

    // 7. Atualizar o cargo
    const updatedCompanyUser = await this.companyUserRepository.update(
      companyUser.id,
      {
        role: input.newRole,
      } as Partial<CompanyUser>,
    );

    return {
      companyUser: updatedCompanyUser,
    };
  }
}

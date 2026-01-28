import { Action, ChecklistItem } from '@/core/domain/action';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { ChecklistItemRepository } from '@/core/ports/repositories/checklist-item.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface CreateActionInput {
  rootCause: string;
  title: string;
  description: string;
  priority: ActionPriority;
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  companyId: string;
  teamId?: string;
  creatorId: string;
  responsibleId: string;
  checklistItems?: {
    description: string;
    isCompleted?: boolean;
    order?: number;
  }[];
}

export interface CreateActionOutput {
  action: Action;
}

@Injectable()
export class CreateActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('ChecklistItemRepository')
    private readonly checklistItemRepository: ChecklistItemRepository,
    @Inject('TransactionManager')
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: CreateActionInput): Promise<CreateActionOutput> {
    await this.validateInput(input);

    return this.transactionManager.execute(async (tx) => {
      const lastKanbanOrder =
        await this.actionRepository.findLastKanbanOrderInColumn(
          ActionStatus.TODO,
          tx,
        );
      const nextPosition = (lastKanbanOrder?.position ?? -1) + 1;

      const action = new Action(
        randomUUID(),
        input.rootCause,
        input.title,
        input.description,
        ActionStatus.TODO,
        input.priority,
        input.estimatedStartDate,
        input.estimatedEndDate,
        null, // actualStartDate
        null, // actualEndDate
        false, // isLate
        false, // isBlocked
        null, // blockedReason
        input.companyId,
        input.teamId ?? null,
        input.creatorId,
        input.responsibleId,
        null, // deletedAt
      );
      const created = await this.actionRepository.createWithKanbanOrder(
        action,
        ActionStatus.TODO,
        nextPosition,
        tx,
      );

      if (input.checklistItems?.length) {
        for (let index = 0; index < input.checklistItems.length; index++) {
          const itemInput = input.checklistItems[index];
          const isCompleted = itemInput.isCompleted ?? false;
          const completedAt = isCompleted ? new Date() : null;
          const order = itemInput.order ?? index;

          const checklistItem = new ChecklistItem(
            randomUUID(),
            created.id,
            itemInput.description,
            isCompleted,
            completedAt,
            order,
          );

          await this.checklistItemRepository.create(checklistItem, tx);
        }
      }

      return {
        action: created,
      };
    });
  }

  private async validateInput(input: CreateActionInput): Promise<void> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    if (input.teamId) {
      const team = await this.teamRepository.findById(input.teamId);
      if (!team) {
        throw new EntityNotFoundException('Equipe', input.teamId);
      }

      if (team.companyId !== input.companyId) {
        throw new DomainValidationException(
          'A equipe não pertence à empresa especificada',
        );
      }
    }

    const creator = await this.userRepository.findById(input.creatorId);
    if (!creator) {
      throw new EntityNotFoundException('Usuário criador', input.creatorId);
    }

    const responsible = await this.userRepository.findById(input.responsibleId);
    if (!responsible) {
      throw new EntityNotFoundException(
        'Usuário responsável',
        input.responsibleId,
      );
    }

    if (input.estimatedEndDate < input.estimatedStartDate) {
      throw new DomainValidationException(
        ErrorMessages.ACTION.ESTIMATED_END_DATE_BEFORE_START,
      );
    }
  }
}

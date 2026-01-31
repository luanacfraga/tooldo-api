import { Action } from '@/core/domain/action/action.entity';
import { ChecklistItem } from '@/core/domain/action/checklist-item.entity';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { ChecklistItemRepository } from '@/core/ports/repositories/checklist-item.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface UpdateActionInput {
  actionId: string;
  rootCause?: string;
  title?: string;
  description?: string;
  priority?: ActionPriority;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  responsibleId?: string;
  teamId?: string;
  actualStartDate?: Date;
  actualEndDate?: Date;
  checklistItems?: {
    description: string;
    isCompleted?: boolean;
    order?: number;
  }[];
}

export interface UpdateActionOutput {
  action: Action;
}

@Injectable()
export class UpdateActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('ChecklistItemRepository')
    private readonly checklistItemRepository: ChecklistItemRepository,
    @Inject('TransactionManager')
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: UpdateActionInput): Promise<UpdateActionOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    if (input.responsibleId) {
      const responsible = await this.userRepository.findById(
        input.responsibleId,
      );
      if (!responsible) {
        throw new EntityNotFoundException(
          'Usuário responsável',
          input.responsibleId,
        );
      }
    }

    const estimatedStartDate =
      input.estimatedStartDate ?? action.estimatedStartDate;
    const estimatedEndDate = input.estimatedEndDate ?? action.estimatedEndDate;

    if (estimatedEndDate < estimatedStartDate) {
      throw new DomainValidationException(
        ErrorMessages.ACTION.ESTIMATED_END_DATE_BEFORE_START,
      );
    }

    const effectiveTeamId =
      input.teamId !== undefined ? input.teamId : action.teamId;
    const effectiveResponsibleId =
      input.responsibleId !== undefined ? input.responsibleId : action.responsibleId;
    if (!effectiveTeamId && effectiveResponsibleId !== action.creatorId) {
      throw new DomainValidationException(
        ErrorMessages.ACTION.RESPONSIBLE_MUST_BE_CREATOR_WHEN_NO_TEAM,
      );
    }

    let newStatus = action.status;

    if (input.actualEndDate && !action.actualEndDate) {
      newStatus = ActionStatus.DONE;
    } else if (input.actualStartDate && !action.actualStartDate) {
      if (action.status === ActionStatus.TODO) {
        newStatus = ActionStatus.IN_PROGRESS;
      }
    }

    const statusChanged = newStatus !== action.status;

    const updated = await this.transactionManager.execute(async (tx) => {
      if (statusChanged) {
        const lastInColumn =
          await this.actionRepository.findLastKanbanOrderInColumn(
            newStatus,
            tx,
          );
        const newPosition = lastInColumn ? lastInColumn.position + 1 : 0;

        const currentKanbanOrder =
          await this.actionRepository.findKanbanOrderByActionId(
            input.actionId,
            tx,
          );

        await this.actionRepository.updateActionsPositionInColumn(
          newStatus,
          newPosition,
          1,
          tx,
        );

        if (currentKanbanOrder?.position !== undefined) {
          await this.actionRepository.updateActionsPositionInColumn(
            action.status,
            currentKanbanOrder.position + 1,
            -1,
            tx,
          );
        }

        const updatedAction = await this.actionRepository.updateWithKanbanOrder(
          input.actionId,
          {
            rootCause: input.rootCause,
            title: input.title,
            description: input.description,
            status: newStatus,
            priority: input.priority,
            estimatedStartDate: input.estimatedStartDate,
            estimatedEndDate: input.estimatedEndDate,
            actualStartDate: input.actualStartDate,
            actualEndDate: input.actualEndDate,
            responsibleId: input.responsibleId,
            teamId: input.teamId,
          },
          {
            column: newStatus,
            position: newPosition,
          },
          tx,
        );

        if (input.checklistItems) {
          await this.checklistItemRepository.deleteByActionId(
            input.actionId,
            tx,
          );

          for (let index = 0; index < input.checklistItems.length; index++) {
            const itemInput = input.checklistItems[index];
            const isCompleted = itemInput.isCompleted ?? false;
            const completedAt = isCompleted ? new Date() : null;
            const order = itemInput.order ?? index;

            const checklistItem = new ChecklistItem(
              randomUUID(),
              input.actionId,
              itemInput.description,
              isCompleted,
              completedAt,
              order,
            );

            await this.checklistItemRepository.create(checklistItem, tx);
          }
        }

        return updatedAction;
      } else {
        const updatedAction = await this.actionRepository.update(
          input.actionId,
          {
            rootCause: input.rootCause,
            title: input.title,
            description: input.description,
            priority: input.priority,
            estimatedStartDate: input.estimatedStartDate,
            estimatedEndDate: input.estimatedEndDate,
            actualStartDate: input.actualStartDate,
            actualEndDate: input.actualEndDate,
            responsibleId: input.responsibleId,
            teamId: input.teamId,
          },
          tx,
        );

        if (input.checklistItems) {
          await this.checklistItemRepository.deleteByActionId(
            input.actionId,
            tx,
          );

          for (let index = 0; index < input.checklistItems.length; index++) {
            const itemInput = input.checklistItems[index];
            const isCompleted = itemInput.isCompleted ?? false;
            const completedAt = isCompleted ? new Date() : null;
            const order = itemInput.order ?? index;

            const checklistItem = new ChecklistItem(
              randomUUID(),
              input.actionId,
              itemInput.description,
              isCompleted,
              completedAt,
              order,
            );

            await this.checklistItemRepository.create(checklistItem, tx);
          }
        }

        return updatedAction;
      }
    });

    return {
      action: updated,
    };
  }
}

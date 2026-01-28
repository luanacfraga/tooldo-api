import { Action } from '@/core/domain/action/action.entity';
import { ActionMovement } from '@/core/domain/action/action-movement.entity';
import { ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface MoveActionInput {
  actionId: string;
  toStatus: ActionStatus;
  position?: number;
  movedById: string;
  notes?: string;
}

export interface MoveActionOutput {
  action: Action;
  movement: ActionMovement;
  kanbanOrder: {
    id: string;
    actionId: string;
    column: ActionStatus;
    position: number;
    sortOrder: number;
    lastMovedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class MoveActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('ActionMovementRepository')
    private readonly actionMovementRepository: ActionMovementRepository,
    @Inject('TransactionManager')
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: MoveActionInput): Promise<MoveActionOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    const currentKanbanOrder =
      await this.actionRepository.findKanbanOrderByActionId(input.actionId);

    const fromStatus = action.status;
    const toStatus = input.toStatus;

    let timeSpent: number | null = null;
    if (currentKanbanOrder) {
      const timeSpentMs = Date.now() - currentKanbanOrder.lastMovedAt.getTime();
      timeSpent = Math.floor(timeSpentMs / 1000);
    }

    const updatedAction = action.updateStatus(toStatus);

    return this.transactionManager.execute(async (tx) => {
      let newPosition = input.position;
      if (newPosition === undefined) {
        const lastInColumn =
          await this.actionRepository.findLastKanbanOrderInColumn(toStatus, tx);
        newPosition = lastInColumn ? lastInColumn.position + 1 : 0;
      }

      const oldPosition = currentKanbanOrder?.position;
      if (fromStatus !== toStatus) {
        await this.handleCrossColumnMove(
          fromStatus,
          toStatus,
          oldPosition,
          newPosition,
          tx,
        );
      } else if (oldPosition !== undefined && oldPosition !== newPosition) {
        await this.handleSameColumnMove(
          fromStatus,
          oldPosition,
          newPosition,
          tx,
        );
      }

      const movement = new ActionMovement(
        randomUUID(),
        action.id,
        fromStatus,
        toStatus,
        input.movedById,
        new Date(),
        input.notes ?? null,
        timeSpent,
      );

      const [savedAction, savedMovement] = await Promise.all([
        this.actionRepository.updateWithKanbanOrder(
          action.id,
          {
            status: updatedAction.status,
            actualStartDate: updatedAction.actualStartDate,
            actualEndDate: updatedAction.actualEndDate,
            isLate: updatedAction.isLate,
          },
          {
            column: toStatus,
            position: newPosition,
          },
          tx,
        ),
        this.actionMovementRepository.create(movement, tx),
      ]);

      const kanbanOrder =
        await this.actionRepository.findFullKanbanOrderByActionId(
          action.id,
          tx,
        );

      if (!kanbanOrder) {
        throw new Error('KanbanOrder not found after update');
      }

      return {
        action: savedAction,
        movement: savedMovement,
        kanbanOrder,
      };
    });
  }

  private async handleCrossColumnMove(
    fromStatus: ActionStatus,
    toStatus: ActionStatus,
    oldPosition: number | undefined,
    newPosition: number,
    tx: unknown,
  ): Promise<void> {
    await this.actionRepository.updateActionsPositionInColumn(
      toStatus,
      newPosition,
      1,
      tx,
    );

    if (oldPosition !== undefined) {
      await this.actionRepository.updateActionsPositionInColumn(
        fromStatus,
        oldPosition + 1,
        -1,
        tx,
      );
    }
  }

  private async handleSameColumnMove(
    column: ActionStatus,
    oldPosition: number,
    newPosition: number,
    tx: unknown,
  ): Promise<void> {
    if (newPosition < oldPosition) {
      await this.actionRepository.updateActionsPositionInRange(
        column,
        newPosition,
        oldPosition - 1,
        1,
        tx,
      );
    } else {
      await this.actionRepository.updateActionsPositionInRange(
        column,
        oldPosition + 1,
        newPosition,
        -1,
        tx,
      );
    }
  }
}

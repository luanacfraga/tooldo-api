import { Action, ActionMovement } from '@/core/domain/action';
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
  position?: number; // Optional: if not provided, will be placed at the end
  movedById: string;
  notes?: string;
}

export interface MoveActionOutput {
  action: Action;
  movement: ActionMovement;
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
    // 1. Find the action
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    // 2. Get current kanban order
    const currentKanbanOrder =
      await this.actionRepository.findKanbanOrderByActionId(input.actionId);

    const fromStatus = action.status;
    const toStatus = input.toStatus;

    // 3. Calculate time spent in previous column (in seconds)
    let timeSpent: number | null = null;
    if (currentKanbanOrder) {
      const timeSpentMs = Date.now() - currentKanbanOrder.lastMovedAt.getTime();
      timeSpent = Math.floor(timeSpentMs / 1000);
    }

    // 4. Update action status with domain logic
    const updatedAction = action.updateStatus(toStatus);

    // 5. Execute all database operations in a transaction
    return this.transactionManager.execute(async (tx) => {
      // 6. Determine new position
      let newPosition = input.position;
      if (newPosition === undefined) {
        // Place at the end of the destination column
        const lastInColumn =
          await this.actionRepository.findLastKanbanOrderInColumn(toStatus, tx);
        newPosition = lastInColumn ? lastInColumn.position + 1 : 0;
      }

      const oldPosition = currentKanbanOrder?.position;

      // 7. Perform reordering based on move type
      if (fromStatus !== toStatus) {
        // Cross-column move
        await this.handleCrossColumnMove(
          fromStatus,
          toStatus,
          oldPosition,
          newPosition,
          tx,
        );
      } else if (oldPosition !== undefined && oldPosition !== newPosition) {
        // Same-column move
        await this.handleSameColumnMove(
          fromStatus,
          oldPosition,
          newPosition,
          tx,
        );
      }

      // 8. Create movement record
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

      // 9. Update action with new status, timestamps, and kanban order
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

      return {
        action: savedAction,
        movement: savedMovement,
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
    // 1. Make space in destination column at newPosition (increment positions >= newPosition)
    await this.actionRepository.updateActionsPositionInColumn(
      toStatus,
      newPosition,
      1,
      tx,
    );

    // 2. Clean up source column (decrement positions > oldPosition)
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
      // Moving up: shift items at positions [newPosition..oldPosition) down by 1
      await this.actionRepository.updateActionsPositionInRange(
        column,
        newPosition,
        oldPosition - 1,
        1,
        tx,
      );
    } else {
      // Moving down: shift items at positions (oldPosition..newPosition] up by 1
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

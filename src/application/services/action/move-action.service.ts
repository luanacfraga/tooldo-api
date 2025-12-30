import { Action, ActionMovement } from '@/core/domain/action';
import { ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
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

    // 5. Determine new position
    let newPosition = input.position;
    if (newPosition === undefined) {
      // Place at the end of the destination column
      const lastInColumn =
        await this.actionRepository.findLastKanbanOrderInColumn(toStatus);
      newPosition = lastInColumn ? lastInColumn.position + 1 : 0;
    }

    // 6. Reorder actions in destination column if inserting at specific position
    if (
      fromStatus !== toStatus ||
      (currentKanbanOrder && currentKanbanOrder.position !== newPosition)
    ) {
      // Make space for the new position in the destination column
      await this.actionRepository.updateActionsPositionInColumn(
        toStatus,
        newPosition,
        1,
      );
    }

    // 7. Create movement record
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

    // 8. Update action with new status, timestamps, and kanban order
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
      ),
      this.actionMovementRepository.create(movement),
    ]);

    return {
      action: savedAction,
      movement: savedMovement,
    };
  }
}

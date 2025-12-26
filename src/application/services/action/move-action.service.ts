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
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    const fromStatus = action.status;
    const updatedAction = action.updateStatus(input.toStatus);

    const movement = new ActionMovement(
      randomUUID(),
      action.id,
      fromStatus,
      input.toStatus,
      input.movedById,
      new Date(),
      input.notes ?? null,
    );

    const [savedAction, savedMovement] = await Promise.all([
      this.actionRepository.update(action.id, {
        status: updatedAction.status,
        actualStartDate: updatedAction.actualStartDate,
        actualEndDate: updatedAction.actualEndDate,
        isLate: updatedAction.isLate,
      }),
      this.actionMovementRepository.create(movement),
    ]);

    return {
      action: savedAction,
      movement: savedMovement,
    };
  }
}

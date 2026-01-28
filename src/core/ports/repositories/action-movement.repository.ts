import { ActionMovement } from '@/core/domain/action/action-movement.entity';

export interface ActionMovementRepository {
  create(movement: ActionMovement, tx?: unknown): Promise<ActionMovement>;
  findByActionId(actionId: string, tx?: unknown): Promise<ActionMovement[]>;
  findById(id: string, tx?: unknown): Promise<ActionMovement | null>;
}

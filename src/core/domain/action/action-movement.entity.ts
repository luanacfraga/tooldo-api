import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { ActionStatus } from '../shared/enums';
import { DomainValidator } from '../shared/validators/domain.validator';

export class ActionMovement extends Entity {
  constructor(
    public readonly id: string,
    public readonly actionId: string,
    public readonly fromStatus: ActionStatus,
    public readonly toStatus: ActionStatus,
    public readonly movedById: string,
    public readonly movedAt: Date,
    public readonly notes: string | null = null,
    public readonly timeSpent: number | null = null, // seconds spent in previous status
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.ACTION_MOVEMENT.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredId(
      this.actionId,
      ErrorMessages.ACTION_MOVEMENT.ACTION_ID_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.movedById,
      ErrorMessages.ACTION_MOVEMENT.MOVED_BY_ID_REQUIRED,
    );
    DomainValidator.validateDate(
      this.movedAt,
      ErrorMessages.ACTION_MOVEMENT.MOVED_AT_INVALID,
    );
  }
}

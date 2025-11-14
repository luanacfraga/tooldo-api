import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class Subscription extends Entity {
  constructor(
    public readonly id: string,
    public readonly adminId: string,
    public readonly planId: string,
    public readonly startedAt: Date,
    public readonly isActive: boolean,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.SUBSCRIPTION.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredId(
      this.adminId,
      ErrorMessages.SUBSCRIPTION.ADMIN_ID_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.planId,
      ErrorMessages.SUBSCRIPTION.PLAN_ID_REQUIRED,
    );
    DomainValidator.validateDate(
      this.startedAt,
      ErrorMessages.SUBSCRIPTION.STARTED_AT_INVALID,
    );
  }
}

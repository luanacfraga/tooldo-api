import { ErrorMessages } from '@/shared/constants/error-messages';
import { DomainValidationException } from '../shared/exceptions/domain.exception';

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly adminId: string,
    public readonly planId: string,
    public readonly startedAt: Date,
    public readonly isActive: boolean,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id?.trim()) {
      throw new DomainValidationException(
        ErrorMessages.SUBSCRIPTION.ID_REQUIRED,
      );
    }
    if (!this.adminId?.trim()) {
      throw new DomainValidationException(
        ErrorMessages.SUBSCRIPTION.ADMIN_ID_REQUIRED,
      );
    }
    if (!this.planId?.trim()) {
      throw new DomainValidationException(
        ErrorMessages.SUBSCRIPTION.PLAN_ID_REQUIRED,
      );
    }
    if (!(this.startedAt instanceof Date) || isNaN(this.startedAt.getTime())) {
      throw new DomainValidationException(
        ErrorMessages.SUBSCRIPTION.STARTED_AT_INVALID,
      );
    }
  }

  static create(
    id: string,
    adminId: string,
    planId: string,
    startedAt: Date = new Date(),
  ): Subscription {
    return new Subscription(id, adminId, planId, startedAt, true);
  }
}

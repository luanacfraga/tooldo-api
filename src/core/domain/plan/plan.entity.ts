import { ErrorMessages } from '@/shared/constants/error-messages';
import { DomainValidationException } from '../shared/exceptions/domain.exception';

export class Plan {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly maxCompanies: number,
    public readonly maxManagers: number,
    public readonly maxExecutors: number,
    public readonly maxConsultants: number,
    public readonly iaCallsLimit: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id?.trim()) {
      throw new DomainValidationException(ErrorMessages.PLAN.ID_REQUIRED);
    }
    if (!this.name?.trim()) {
      throw new DomainValidationException(ErrorMessages.PLAN.NAME_REQUIRED);
    }
    if (this.maxCompanies < 0) {
      throw new DomainValidationException(
        ErrorMessages.PLAN.MAX_COMPANIES_INVALID,
      );
    }
    if (this.maxManagers < 0) {
      throw new DomainValidationException(
        ErrorMessages.PLAN.MAX_MANAGERS_INVALID,
      );
    }
    if (this.maxExecutors < 0) {
      throw new DomainValidationException(
        ErrorMessages.PLAN.MAX_EXECUTORS_INVALID,
      );
    }
    if (this.maxConsultants < 0) {
      throw new DomainValidationException(
        ErrorMessages.PLAN.MAX_CONSULTANTS_INVALID,
      );
    }
    if (this.iaCallsLimit < 0) {
      throw new DomainValidationException(
        ErrorMessages.PLAN.IA_CALLS_LIMIT_INVALID,
      );
    }
  }
}

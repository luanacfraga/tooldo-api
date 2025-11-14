import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class Plan extends Entity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly maxCompanies: number,
    public readonly maxManagers: number,
    public readonly maxExecutors: number,
    public readonly maxConsultants: number,
    public readonly iaCallsLimit: number,
  ) {
    super(id);
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.PLAN.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredString(
      this.name,
      ErrorMessages.PLAN.NAME_REQUIRED,
    );
    DomainValidator.validateNonNegativeNumber(
      this.maxCompanies,
      ErrorMessages.PLAN.MAX_COMPANIES_INVALID,
    );
    DomainValidator.validateNonNegativeNumber(
      this.maxManagers,
      ErrorMessages.PLAN.MAX_MANAGERS_INVALID,
    );
    DomainValidator.validateNonNegativeNumber(
      this.maxExecutors,
      ErrorMessages.PLAN.MAX_EXECUTORS_INVALID,
    );
    DomainValidator.validateNonNegativeNumber(
      this.maxConsultants,
      ErrorMessages.PLAN.MAX_CONSULTANTS_INVALID,
    );
    DomainValidator.validateNonNegativeNumber(
      this.iaCallsLimit,
      ErrorMessages.PLAN.IA_CALLS_LIMIT_INVALID,
    );
  }
}

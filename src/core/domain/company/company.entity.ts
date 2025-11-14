import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class Company extends Entity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly adminId: string,
  ) {
    super(id);
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.COMPANY.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredString(
      this.name,
      ErrorMessages.COMPANY.NAME_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.adminId,
      ErrorMessages.COMPANY.ADMIN_ID_REQUIRED,
    );
  }
}

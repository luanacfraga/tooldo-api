import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class Team extends Entity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly iaContext: string | null,
    public readonly companyId: string,
    public readonly managerId: string,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.TEAM.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredString(
      this.name,
      ErrorMessages.TEAM.NAME_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.companyId,
      ErrorMessages.TEAM.COMPANY_ID_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.managerId,
      ErrorMessages.TEAM.MANAGER_ID_REQUIRED,
    );
  }
}

export type UpdateTeamData = {
  name: string;
  description: string | null;
  iaContext: string | null;
  managerId: string;
};

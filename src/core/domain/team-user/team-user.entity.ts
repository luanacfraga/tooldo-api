import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class TeamUser extends Entity {
  constructor(
    public readonly id: string,
    public readonly teamId: string,
    public readonly userId: string,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.TEAM_USER.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredId(
      this.teamId,
      ErrorMessages.TEAM_USER.TEAM_ID_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.userId,
      ErrorMessages.TEAM_USER.USER_ID_REQUIRED,
    );
  }
}

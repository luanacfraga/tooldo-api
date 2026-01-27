import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class IAUsage extends Entity {
  constructor(
    public readonly id: string,
    public readonly subscriptionId: string,
    public readonly userId: string | null,
    public readonly companyId: string | null,
    public readonly tokensUsed: number,
    public readonly createdAt: Date,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.IA_USAGE.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredId(
      this.subscriptionId,
      ErrorMessages.IA_USAGE.SUBSCRIPTION_ID_REQUIRED,
    );

    if (this.tokensUsed < 0) {
      throw new Error(ErrorMessages.IA_USAGE.TOKENS_USED_INVALID);
    }

    DomainValidator.validateDate(
      this.createdAt,
      ErrorMessages.IA_USAGE.CREATED_AT_INVALID,
    );
  }
}

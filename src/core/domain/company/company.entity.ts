import { ErrorMessages } from '@/shared/constants/error-messages';
import { DomainValidationException } from '../shared/exceptions/domain.exception';

export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly adminId: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id?.trim()) {
      throw new DomainValidationException(ErrorMessages.COMPANY.ID_REQUIRED);
    }
    if (!this.name?.trim()) {
      throw new DomainValidationException(ErrorMessages.COMPANY.NAME_REQUIRED);
    }
    if (!this.adminId?.trim()) {
      throw new DomainValidationException(
        ErrorMessages.COMPANY.ADMIN_ID_REQUIRED,
      );
    }
  }
}

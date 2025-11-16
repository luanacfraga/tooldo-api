import { ErrorMessages } from '@/shared/constants/error-messages';
import { CompanyUserStatus, UserRole } from '../shared/enums';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class CompanyUser extends Entity {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly userId: string,
    public readonly role: UserRole,
    public readonly status: CompanyUserStatus,
    public readonly position: string | null = null,
    public readonly notes: string | null = null,
    public readonly metadata: Record<string, any> | null = null,
    public readonly invitedAt: Date | null = null,
    public readonly invitedBy: string | null = null,
    public readonly acceptedAt: Date | null = null,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.COMPANY_USER.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredId(
      this.companyId,
      ErrorMessages.COMPANY_USER.COMPANY_ID_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.userId,
      ErrorMessages.COMPANY_USER.USER_ID_REQUIRED,
    );

    if (!Object.values(UserRole).includes(this.role)) {
      throw new Error(ErrorMessages.COMPANY_USER.ROLE_REQUIRED);
    }

    if (!Object.values(CompanyUserStatus).includes(this.status)) {
      throw new Error(ErrorMessages.COMPANY_USER.STATUS_REQUIRED);
    }
  }

  isInvited(): boolean {
    return this.status === CompanyUserStatus.INVITED;
  }

  isActive(): boolean {
    return this.status === CompanyUserStatus.ACTIVE;
  }

  isSuspended(): boolean {
    return this.status === CompanyUserStatus.SUSPENDED;
  }

  isRemoved(): boolean {
    return this.status === CompanyUserStatus.REMOVED;
  }

  isRejected(): boolean {
    return this.status === CompanyUserStatus.REJECTED;
  }

  canAcceptInvite(): boolean {
    return this.isInvited();
  }

  canBeActivated(): boolean {
    return this.isSuspended();
  }

  canBeSuspended(): boolean {
    return this.isActive();
  }

  canBeRemoved(): boolean {
    return this.isActive() || this.isSuspended();
  }
}

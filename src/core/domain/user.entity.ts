import { ErrorMessages } from '@/shared/constants/error-messages';
import { DocumentType, UserRole, UserStatus } from './enums';
import { DomainValidationException } from './exceptions/domain.exception';

export class User {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly document: string,
    public readonly documentType: DocumentType,
    private readonly _password: string,
    public readonly role: UserRole,
    public readonly status: UserStatus,
    public readonly profileImageUrl: string | null = null,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id?.trim()) {
      throw new DomainValidationException(ErrorMessages.USER.ID_REQUIRED);
    }
    if (!this.firstName?.trim()) {
      throw new DomainValidationException(
        ErrorMessages.USER.FIRST_NAME_REQUIRED,
      );
    }
    if (!this.lastName?.trim()) {
      throw new DomainValidationException(
        ErrorMessages.USER.LAST_NAME_REQUIRED,
      );
    }
    if (!this.email?.trim()) {
      throw new DomainValidationException(ErrorMessages.USER.EMAIL_REQUIRED);
    }
    if (!this.phone?.trim()) {
      throw new DomainValidationException(ErrorMessages.USER.PHONE_REQUIRED);
    }
    if (!this.document?.trim()) {
      throw new DomainValidationException(ErrorMessages.USER.DOCUMENT_REQUIRED);
    }
    if (!this._password?.trim()) {
      throw new DomainValidationException(ErrorMessages.USER.PASSWORD_REQUIRED);
    }
  }

  get password(): string {
    return this._password;
  }

  static createAdmin(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    document: string,
    documentType: DocumentType,
    hashedPassword: string,
    profileImageUrl: string | null = null,
  ): User {
    return new User(
      id,
      firstName,
      lastName,
      email,
      phone,
      document,
      documentType,
      hashedPassword,
      UserRole.ADMIN,
      UserStatus.ACTIVE,
      profileImageUrl,
    );
  }

  toPublic(): Omit<User, '_password' | 'password' | 'validate' | 'toPublic'> {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      document: this.document,
      documentType: this.documentType,
      role: this.role,
      status: this.status,
      profileImageUrl: this.profileImageUrl,
    };
  }
}

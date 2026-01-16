import { ErrorMessages } from '@/shared/constants/error-messages';
import { DocumentType, UserRole, UserStatus } from '../shared/enums';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class User extends Entity {
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
    public readonly avatarColor: string | null = null,
    public readonly initials: string | null = null,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.USER.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredString(
      this.firstName,
      ErrorMessages.USER.FIRST_NAME_REQUIRED,
    );
    DomainValidator.validateRequiredString(
      this.lastName,
      ErrorMessages.USER.LAST_NAME_REQUIRED,
    );
    DomainValidator.validateRequiredString(
      this.email,
      ErrorMessages.USER.EMAIL_REQUIRED,
    );
    DomainValidator.validateRequiredString(
      this.phone,
      ErrorMessages.USER.PHONE_REQUIRED,
    );
    // Documento é obrigatório, mas pode ser temporário (temp_*) quando não fornecido
    DomainValidator.validateRequiredString(
      this.document,
      ErrorMessages.USER.DOCUMENT_REQUIRED,
    );
    DomainValidator.validateRequiredString(
      this._password,
      ErrorMessages.USER.PASSWORD_REQUIRED,
    );
  }

  get password(): string {
    return this._password;
  }
}

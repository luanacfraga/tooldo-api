import { DocumentType, UserRole, UserStatus } from './enums';

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
      throw new Error('User id is required');
    }
    if (!this.firstName?.trim()) {
      throw new Error('User first name is required');
    }
    if (!this.lastName?.trim()) {
      throw new Error('User last name is required');
    }
    if (!this.email?.trim()) {
      throw new Error('User email is required');
    }
    if (!this.phone?.trim()) {
      throw new Error('User phone is required');
    }
    if (!this.document?.trim()) {
      throw new Error('User document is required');
    }
    if (!this._password?.trim()) {
      throw new Error('User password is required');
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

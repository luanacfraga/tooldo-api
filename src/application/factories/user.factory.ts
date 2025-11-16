import { DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';
import { User } from '@/core/domain/user/user.entity';
import { Injectable } from '@nestjs/common';

export interface CreateUserInput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
  documentType: DocumentType;
  hashedPassword: string;
  role: UserRole;
  status?: UserStatus;
  profileImageUrl?: string | null;
}

@Injectable()
export class UserFactory {
  createAdmin(input: Omit<CreateUserInput, 'role' | 'status'>): User {
    return new User(
      input.id,
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.document,
      input.documentType,
      input.hashedPassword,
      UserRole.ADMIN,
      UserStatus.ACTIVE,
      input.profileImageUrl ?? null,
    );
  }

  createMaster(input: Omit<CreateUserInput, 'role' | 'status'>): User {
    return new User(
      input.id,
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.document,
      input.documentType,
      input.hashedPassword,
      UserRole.MASTER,
      UserStatus.ACTIVE,
      input.profileImageUrl ?? null,
    );
  }

  create(input: CreateUserInput): User {
    return new User(
      input.id,
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.document,
      input.documentType,
      input.hashedPassword,
      input.role,
      input.status ?? UserStatus.ACTIVE,
      input.profileImageUrl ?? null,
    );
  }
}

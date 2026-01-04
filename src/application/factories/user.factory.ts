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
    const initials = this.generateInitials(input.firstName, input.lastName);
    const avatarColor = this.generateAvatarColor(
      input.firstName + input.lastName + input.email,
    );

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
      avatarColor,
      initials,
    );
  }

  createMaster(input: Omit<CreateUserInput, 'role' | 'status'>): User {
    const initials = this.generateInitials(input.firstName, input.lastName);
    const avatarColor = this.generateAvatarColor(
      input.firstName + input.lastName + input.email,
    );

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
      avatarColor,
      initials,
    );
  }

  create(input: CreateUserInput): User {
    const initials = this.generateInitials(input.firstName, input.lastName);
    const avatarColor = this.generateAvatarColor(
      input.firstName + input.lastName + input.email,
    );

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
      avatarColor,
      initials,
    );
  }

  private generateInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  private generateAvatarColor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();

    // Pad with zeros and prepend #
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }
}

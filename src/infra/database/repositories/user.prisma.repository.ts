import { DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';
import { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * IMPORTANT:
   * Our current DB does NOT have the `users.avatar_color` nor `users.initials` columns.
   * So we must ALWAYS use explicit selects to avoid Prisma selecting it by default.
   */
  private readonly safeUserSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    document: true,
    documentType: true,
    password: true,
    role: true,
    status: true,
    profileImageUrl: true,
  } as const;

  async findByEmail(email: string, tx?: unknown): Promise<User | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const user = await client.user.findUnique({
      where: { email },
      select: this.safeUserSelect,
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByPhone(phone: string, tx?: unknown): Promise<User | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const user = await client.user.findUnique({
      where: { phone },
      select: this.safeUserSelect,
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByDocument(document: string, tx?: unknown): Promise<User | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const user = await client.user.findUnique({
      where: { document },
      select: this.safeUserSelect,
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findById(id: string, tx?: unknown): Promise<User | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const user = await client.user.findUnique({
      where: { id },
      select: this.safeUserSelect,
    });

    return user ? this.mapToDomain(user) : null;
  }

  async create(user: User, tx?: unknown): Promise<User> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.user.create({
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        document: user.document,
        documentType: user.documentType,
        password: user.password,
        role: user.role,
        status: user.status,
        profileImageUrl: user.profileImageUrl,
      },
      select: this.safeUserSelect,
    });

    return this.mapToDomain(created);
  }

  async update(id: string, data: Partial<User>, tx?: unknown): Promise<User> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const updated = await client.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        document: data.document,
        documentType: data.documentType,
        password: data.password,
        role: data.role,
        status: data.status,
        profileImageUrl: data.profileImageUrl,
      },
      select: this.safeUserSelect,
    });

    return this.mapToDomain(updated);
  }

  private mapToDomain(
    prismaUser: Pick<
      PrismaUser,
      | 'id'
      | 'firstName'
      | 'lastName'
      | 'email'
      | 'phone'
      | 'document'
      | 'documentType'
      | 'password'
      | 'role'
      | 'status'
      | 'profileImageUrl'
    >,
  ): User {
    return new User(
      prismaUser.id,
      prismaUser.firstName,
      prismaUser.lastName,
      prismaUser.email,
      prismaUser.phone,
      prismaUser.document,
      prismaUser.documentType as DocumentType,
      prismaUser.password,
      prismaUser.role as UserRole,
      prismaUser.status as UserStatus,
      prismaUser.profileImageUrl,
      null,
      null,
    );
  }
}

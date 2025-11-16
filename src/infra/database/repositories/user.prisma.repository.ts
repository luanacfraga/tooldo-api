import { DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';
import { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string, tx?: unknown): Promise<User | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const user = await client.user.findUnique({
      where: { email },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByPhone(phone: string, tx?: unknown): Promise<User | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const user = await client.user.findUnique({
      where: { phone },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByDocument(document: string, tx?: unknown): Promise<User | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const user = await client.user.findUnique({
      where: { document },
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
    });

    return this.mapToDomain(created);
  }

  private mapToDomain(prismaUser: PrismaUser): User {
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
    );
  }
}

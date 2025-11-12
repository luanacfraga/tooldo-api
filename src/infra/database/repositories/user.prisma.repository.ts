import { DocumentType, UserRole, UserStatus } from '@/core/domain/enums';
import { User } from '@/core/domain/user.entity';
import type { UserRepository } from '@/core/ports/user.repository';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByDocument(document: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { document },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
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

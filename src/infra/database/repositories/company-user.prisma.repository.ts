import {
  CompanyUser,
  type MetadataValue,
} from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  CompanyUser as PrismaCompanyUser,
  User as PrismaUser,
} from '@prisma/client';

interface CompanyUserWhereInput {
  companyId: string;
  status?: CompanyUserStatus;
}

interface CompanyUserOrderByInput {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  role?: 'asc' | 'desc';
  status?: 'asc' | 'desc';
  user?: {
    firstName?: 'asc' | 'desc';
    lastName?: 'asc' | 'desc';
    email?: 'asc' | 'desc';
    [key: string]: 'asc' | 'desc' | undefined;
  };
  [key: string]:
    | 'asc'
    | 'desc'
    | { [key: string]: 'asc' | 'desc' | undefined }
    | undefined;
}

interface CompanyUserWithUser extends CompanyUser {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
  };
}

@Injectable()
export class CompanyUserPrismaRepository implements CompanyUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyUser: CompanyUser, tx?: unknown): Promise<CompanyUser> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.companyUser.create({
      data: {
        id: companyUser.id,
        companyId: companyUser.companyId,
        userId: companyUser.userId,
        role: companyUser.role,
        status: companyUser.status,
        position: companyUser.position,
        notes: companyUser.notes,
        metadata: companyUser.metadata as Prisma.InputJsonValue,
        invitedAt: companyUser.invitedAt,
        invitedBy: companyUser.invitedBy,
        acceptedAt: companyUser.acceptedAt,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string, tx?: unknown): Promise<CompanyUser | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const companyUser = await client.companyUser.findUnique({
      where: { id },
    });

    return companyUser ? this.mapToDomain(companyUser) : null;
  }

  async findByCompanyAndUser(
    companyId: string,
    userId: string,
    tx?: unknown,
  ): Promise<CompanyUser | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const companyUser = await client.companyUser.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    });

    return companyUser ? this.mapToDomain(companyUser) : null;
  }

  async findByCompanyId(
    companyId: string,
    tx?: unknown,
  ): Promise<CompanyUser[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const companyUsersWithoutUser = await client.companyUser.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = companyUsersWithoutUser
      .map((cu) => cu.userId)
      .filter((id): id is string => id !== null);

    const users: PrismaUser[] =
      userIds.length > 0
        ? (
            await Promise.all(
              userIds.map((id) => client.user.findUnique({ where: { id } })),
            )
          ).filter((user): user is PrismaUser => user !== null)
        : [];

    const userMap = new Map(users.map((u) => [u.id, u]));
    const companyUsers = companyUsersWithoutUser.map((cu) => ({
      ...cu,
      user: userMap.get(cu.userId) ?? null,
    }));

    return companyUsers.map((cu) => this.mapToDomainWithUser(cu));
  }

  async findByUserId(
    userId: string,
    status?: CompanyUserStatus,
    tx?: unknown,
  ): Promise<CompanyUser[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const where: Prisma.CompanyUserWhereInput = { userId };
    if (status) {
      where.status = status;
    }
    const companyUsers = await client.companyUser.findMany({
      where,
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });

    return companyUsers.map((cu) => this.mapToDomain(cu));
  }

  async findByCompanyIdAndStatus(
    companyId: string,
    status: CompanyUserStatus,
    tx?: unknown,
  ): Promise<CompanyUser[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const companyUsersWithoutUser = await client.companyUser.findMany({
      where: {
        companyId,
        status,
      },
      orderBy: { createdAt: 'desc' },
    });

    const userIds = companyUsersWithoutUser
      .map((cu) => cu.userId)
      .filter((id): id is string => id !== null);

    const users: PrismaUser[] =
      userIds.length > 0
        ? (
            await Promise.all(
              userIds.map((id) => client.user.findUnique({ where: { id } })),
            )
          ).filter((user): user is PrismaUser => user !== null)
        : [];

    const userMap = new Map(users.map((u) => [u.id, u]));
    const companyUsers = companyUsersWithoutUser.map((cu) => ({
      ...cu,
      user: userMap.get(cu.userId) ?? null,
    }));

    return companyUsers.map((cu) => this.mapToDomainWithUser(cu));
  }

  async findByCompanyIdPaginated(
    companyId: string,
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: CompanyUserStatus;
    },
    tx?: unknown,
  ): Promise<{ employees: CompanyUser[]; total: number }> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const {
      page,
      limit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
    } = options;

    const where: CompanyUserWhereInput = { companyId };
    if (status) {
      where.status = status;
    }

    const validSortFields = ['createdAt', 'updatedAt', 'role', 'status'];
    const userSortFields = ['firstName', 'lastName', 'email'];

    const shouldSortInMemory = userSortFields.includes(sortBy);

    const orderBy: CompanyUserOrderByInput = {};
    if (!shouldSortInMemory) {
      const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      orderBy[field] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const total = await client.companyUser.count({ where });

    let companyUsers: (PrismaCompanyUser & { user?: PrismaUser | null })[];

    if (shouldSortInMemory) {
      const allCompanyUsers = await client.companyUser.findMany({
        where,
        orderBy,
      });

      const userIds = allCompanyUsers
        .map((cu) => cu.userId)
        .filter((id): id is string => id !== null);

      const users: PrismaUser[] =
        userIds.length > 0
          ? (
              await Promise.all(
                userIds.map((id) => client.user.findUnique({ where: { id } })),
              )
            ).filter((user): user is PrismaUser => user !== null)
          : [];

      const userMap = new Map(users.map((u) => [u.id, u]));
      const allCompanyUsersWithUser = allCompanyUsers.map((cu) => ({
        ...cu,
        user: userMap.get(cu.userId) ?? null,
      }));

      allCompanyUsersWithUser.sort((a, b) => {
        const aValue = a.user?.[sortBy as keyof PrismaUser];
        const bValue = b.user?.[sortBy as keyof PrismaUser];

        if (
          (aValue === null || aValue === undefined) &&
          (bValue === null || bValue === undefined)
        ) {
          return 0;
        }
        if (aValue === null || aValue === undefined) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        if (bValue === null || bValue === undefined) {
          return sortOrder === 'asc' ? -1 : 1;
        }

        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      const skip = (page - 1) * limit;
      companyUsers = allCompanyUsersWithUser.slice(skip, skip + limit);
    } else {
      const companyUsersWithoutUser = await client.companyUser.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      });

      const userIds = companyUsersWithoutUser
        .map((cu) => cu.userId)
        .filter((id): id is string => id !== null);

      const users: PrismaUser[] =
        userIds.length > 0
          ? (
              await Promise.all(
                userIds.map((id) => client.user.findUnique({ where: { id } })),
              )
            ).filter((user): user is PrismaUser => user !== null)
          : [];

      const userMap = new Map(users.map((u) => [u.id, u]));
      companyUsers = companyUsersWithoutUser.map((cu) => ({
        ...cu,
        user: userMap.get(cu.userId) ?? null,
      }));
    }

    return {
      employees: companyUsers.map((cu) => this.mapToDomainWithUser(cu)),
      total,
    };
  }

  async countByAdminIdAndRole(
    adminId: string,
    role: UserRole,
    tx?: unknown,
  ): Promise<number> {
    const client = (tx as typeof this.prisma) ?? this.prisma;

    return client.companyUser.count({
      where: {
        role,
        company: {
          adminId,
        },
      },
    });
  }

  async countByAdminIdRoleAndStatus(
    adminId: string,
    role: UserRole,
    status: CompanyUserStatus,
    tx?: unknown,
  ): Promise<number> {
    const client = (tx as typeof this.prisma) ?? this.prisma;

    return client.companyUser.count({
      where: {
        role,
        status,
        company: {
          adminId,
        },
      },
    });
  }

  async update(
    id: string,
    data: Partial<CompanyUser>,
    tx?: unknown,
  ): Promise<CompanyUser> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const updated = await client.companyUser.update({
      where: { id },
      data: {
        role: data.role,
        status: data.status,
        position: data.position,
        notes: data.notes,
        metadata: data.metadata as Prisma.InputJsonValue,
        invitedAt: data.invitedAt,
        invitedBy: data.invitedBy,
        acceptedAt: data.acceptedAt,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string, tx?: unknown): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.companyUser.delete({
      where: { id },
    });
  }

  private mapToDomain(prismaCompanyUser: PrismaCompanyUser): CompanyUser {
    return new CompanyUser(
      prismaCompanyUser.id,
      prismaCompanyUser.companyId,
      prismaCompanyUser.userId,
      prismaCompanyUser.role as UserRole,
      prismaCompanyUser.status as CompanyUserStatus,
      prismaCompanyUser.position,
      prismaCompanyUser.notes,
      prismaCompanyUser.metadata as Record<string, MetadataValue> | null,
      prismaCompanyUser.invitedAt,
      prismaCompanyUser.invitedBy,
      prismaCompanyUser.acceptedAt,
    );
  }

  private mapToDomainWithUser(
    prismaCompanyUser: PrismaCompanyUser & { user?: PrismaUser | null },
  ): CompanyUserWithUser {
    const companyUser = this.mapToDomain(prismaCompanyUser);
    const result: CompanyUserWithUser = Object.assign(
      {},
      companyUser,
    ) as CompanyUserWithUser;

    if (prismaCompanyUser.user) {
      result.user = prismaCompanyUser.user;
    }

    return result;
  }
}

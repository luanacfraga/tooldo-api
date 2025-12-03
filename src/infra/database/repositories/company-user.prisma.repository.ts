import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  CompanyUser as PrismaCompanyUser,
  User as PrismaUser,
} from '@prisma/client';

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
        metadata: companyUser.metadata as any,
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
    const companyUsers = await client.companyUser.findMany({
      where: { companyId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return companyUsers.map((cu) =>
      this.mapToDomainWithUser(cu),
    ) as CompanyUser[];
  }

  async findByCompanyIdAndStatus(
    companyId: string,
    status: CompanyUserStatus,
    tx?: unknown,
  ): Promise<CompanyUser[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const companyUsers = await client.companyUser.findMany({
      where: {
        companyId,
        status,
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    return companyUsers.map((cu) =>
      this.mapToDomainWithUser(cu),
    ) as CompanyUser[];
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
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc', status } = options;

    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    const orderBy: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'role', 'status'];
    const userSortFields = ['firstName', 'lastName', 'email'];
    
    if (userSortFields.includes(sortBy)) {
      orderBy.user = {};
      orderBy.user[sortBy] = sortOrder;
    } else {
      const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      orderBy[field] = sortOrder;
    }

    const [companyUsers, total] = await Promise.all([
      client.companyUser.findMany({
        where,
        include: { user: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      client.companyUser.count({ where }),
    ]);

    return {
      employees: companyUsers.map((cu) =>
        this.mapToDomainWithUser(cu),
      ) as CompanyUser[],
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
        metadata: data.metadata as any,
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
      prismaCompanyUser.metadata as Record<string, any> | null,
      prismaCompanyUser.invitedAt,
      prismaCompanyUser.invitedBy,
      prismaCompanyUser.acceptedAt,
    );
  }

  private mapToDomainWithUser(
    prismaCompanyUser: PrismaCompanyUser & { user?: PrismaUser | null },
  ): any {
    const companyUser = this.mapToDomain(prismaCompanyUser);
    const result: any = Object.assign({}, companyUser);

    if (prismaCompanyUser.user) {
      result.user = prismaCompanyUser.user;
    }

    return result;
  }
}

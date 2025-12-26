import { Action } from '@/core/domain/action';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import type {
  ActionFilters,
  ActionRepository,
  UpdateActionData,
} from '@/core/ports/repositories/action.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Action as PrismaAction, Prisma } from '@prisma/client';

@Injectable()
export class ActionPrismaRepository implements ActionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(action: Action, tx?: unknown): Promise<Action> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.action.create({
      data: {
        id: action.id,
        title: action.title,
        description: action.description,
        status: action.status,
        priority: action.priority,
        estimatedStartDate: action.estimatedStartDate,
        estimatedEndDate: action.estimatedEndDate,
        actualStartDate: action.actualStartDate,
        actualEndDate: action.actualEndDate,
        isLate: action.isLate,
        isBlocked: action.isBlocked,
        blockedReason: action.blockedReason,
        companyId: action.companyId,
        teamId: action.teamId,
        creatorId: action.creatorId,
        responsibleId: action.responsibleId,
        deletedAt: action.deletedAt,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(
    id: string,
    includeDeleted = false,
    tx?: unknown,
  ): Promise<Action | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const action = await client.action.findUnique({
      where: { id },
    });

    if (!action) {
      return null;
    }
    if (!includeDeleted && action.deletedAt !== null) {
      return null;
    }

    return this.mapToDomain(action);
  }

  async findByCompanyId(
    companyId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const where = this.buildWhereClause(companyId, undefined, filters);

    const actions = await client.action.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });

    return actions.map((action) => this.mapToDomain(action));
  }

  async findByTeamId(
    teamId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const where = this.buildWhereClause(undefined, teamId, filters);

    const actions = await client.action.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });

    return actions.map((action) => this.mapToDomain(action));
  }

  async findByResponsibleId(
    responsibleId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const where: Prisma.ActionWhereInput = {
      responsibleId,
      ...this.buildFilters(filters),
    };

    const actions = await client.action.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });

    return actions.map((action) => this.mapToDomain(action));
  }

  async update(
    id: string,
    data: Partial<UpdateActionData>,
    tx?: unknown,
  ): Promise<Action> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const updated = await client.action.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        estimatedStartDate: data.estimatedStartDate,
        estimatedEndDate: data.estimatedEndDate,
        actualStartDate: data.actualStartDate,
        actualEndDate: data.actualEndDate,
        isLate: data.isLate,
        isBlocked: data.isBlocked,
        blockedReason: data.blockedReason,
        responsibleId: data.responsibleId,
        teamId: data.teamId,
      },
    });

    return this.mapToDomain(updated);
  }

  async softDelete(id: string, tx?: unknown): Promise<Action> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const deleted = await client.action.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return this.mapToDomain(deleted);
  }

  async delete(id: string, tx?: unknown): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.action.delete({
      where: { id },
    });
  }

  private buildWhereClause(
    companyId?: string,
    teamId?: string,
    filters?: ActionFilters,
  ): Prisma.ActionWhereInput {
    const where: Prisma.ActionWhereInput = {
      ...this.buildFilters(filters),
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    return where;
  }

  private buildFilters(filters?: ActionFilters): Prisma.ActionWhereInput {
    const where: Prisma.ActionWhereInput = {};

    if (!filters) {
      where.deletedAt = null;
      return where;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.responsibleId) {
      where.responsibleId = filters.responsibleId;
    }

    if (filters.teamId) {
      where.teamId = filters.teamId;
    }

    if (filters.isLate !== undefined) {
      where.isLate = filters.isLate;
    }

    if (filters.isBlocked !== undefined) {
      where.isBlocked = filters.isBlocked;
    }

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    return where;
  }

  private mapToDomain(prismaAction: PrismaAction): Action {
    return new Action(
      prismaAction.id,
      prismaAction.title,
      prismaAction.description,
      prismaAction.status as ActionStatus,
      prismaAction.priority as ActionPriority,
      prismaAction.estimatedStartDate,
      prismaAction.estimatedEndDate,
      prismaAction.actualStartDate,
      prismaAction.actualEndDate,
      prismaAction.isLate,
      prismaAction.isBlocked,
      prismaAction.blockedReason,
      prismaAction.companyId,
      prismaAction.teamId,
      prismaAction.creatorId,
      prismaAction.responsibleId,
      prismaAction.deletedAt,
    );
  }
}

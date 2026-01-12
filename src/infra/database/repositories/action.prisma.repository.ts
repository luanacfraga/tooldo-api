import { Action, ChecklistItem } from '@/core/domain/action';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import type {
  ActionFilters,
  ActionRepository,
  ActionResponsibleUser,
  ActionWithChecklistItems,
  UpdateActionData,
} from '@/core/ports/repositories/action.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Action as PrismaAction,
  ChecklistItem as PrismaChecklistItem,
} from '@prisma/client';

@Injectable()
export class ActionPrismaRepository implements ActionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapResponsibleToDto(
    responsible:
      | { id: string; firstName: string; lastName: string }
      | null
      | undefined,
  ): ActionResponsibleUser | undefined {
    if (!responsible) {
      return undefined;
    }
    return {
      id: responsible.id,
      firstName: responsible.firstName,
      lastName: responsible.lastName,
    };
  }

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

  async findByIdWithChecklistItems(
    id: string,
    includeDeleted = false,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const result = await client.action.findUnique({
      where: { id },
      include: {
        kanbanOrder: true,
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        checklistItems: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!result) {
      return null;
    }
    if (!includeDeleted && result.deletedAt !== null) {
      return null;
    }

    const action = this.mapToDomain(result);

    return {
      action,
      checklistItems: result.checklistItems.map((item) =>
        this.mapChecklistItemToDomain(item),
      ),
      kanbanOrder: result.kanbanOrder ?? null,
      responsible: this.mapResponsibleToDto(result.responsible),
      lateStatus: action.calculateLateStatus(),
      createdAt: result.createdAt,
    };
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
      orderBy: [{ kanbanOrder: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });

    return actions.map((action) => this.mapToDomain(action));
  }

  async findByCompanyIdWithChecklistItems(
    companyId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const where = this.buildWhereClause(companyId, undefined, filters);

    const results = await client.action.findMany({
      where,
      include: {
        kanbanOrder: true,
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        checklistItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ kanbanOrder: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });

    return results.map((result) => {
      const action = this.mapToDomain(result);

      return {
        action,
        checklistItems: result.checklistItems.map((item) =>
          this.mapChecklistItemToDomain(item),
        ),
        kanbanOrder: result.kanbanOrder ?? null,
        responsible: this.mapResponsibleToDto(result.responsible),
        lateStatus: action.calculateLateStatus(),
        createdAt: result.createdAt,
      };
    });
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
      orderBy: [{ kanbanOrder: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });

    return actions.map((action) => this.mapToDomain(action));
  }

  async findByTeamIdWithChecklistItems(
    teamId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const where = this.buildWhereClause(undefined, teamId, filters);

    const results = await client.action.findMany({
      where,
      include: {
        kanbanOrder: true,
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        checklistItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ kanbanOrder: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });

    return results.map((result) => {
      const action = this.mapToDomain(result);

      return {
        action,
        checklistItems: result.checklistItems.map((item) =>
          this.mapChecklistItemToDomain(item),
        ),
        kanbanOrder: result.kanbanOrder ?? null,
        responsible: this.mapResponsibleToDto(result.responsible),
        lateStatus: action.calculateLateStatus(),
        createdAt: result.createdAt,
      };
    });
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
      orderBy: [{ kanbanOrder: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });

    return actions.map((action) => this.mapToDomain(action));
  }

  async findByResponsibleIdWithChecklistItems(
    responsibleId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const where: Prisma.ActionWhereInput = {
      responsibleId,
      ...this.buildFilters(filters),
    };

    const results = await client.action.findMany({
      where,
      include: {
        kanbanOrder: true,
        responsible: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        checklistItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ kanbanOrder: { sortOrder: 'asc' } }, { createdAt: 'desc' }],
    });

    return results.map((result) => {
      const action = this.mapToDomain(result);

      return {
        action,
        checklistItems: result.checklistItems.map((item) =>
          this.mapChecklistItemToDomain(item),
        ),
        kanbanOrder: result.kanbanOrder ?? null,
        responsible: this.mapResponsibleToDto(result.responsible),
        lateStatus: action.calculateLateStatus(),
        createdAt: result.createdAt,
      };
    });
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

  async findLastKanbanOrderInColumn(
    column: ActionStatus,
    tx?: unknown,
  ): Promise<{ position: number } | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    return client.kanbanOrder.findFirst({
      where: { column },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
  }

  async createWithKanbanOrder(
    action: Action,
    column: ActionStatus,
    position: number,
    tx?: unknown,
  ): Promise<Action> {
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
        kanbanOrder: {
          create: {
            column,
            position,
            sortOrder: position,
          },
        },
      },
      include: {
        kanbanOrder: true,
      },
    });

    return this.mapToDomain(created);
  }

  async updateActionsPositionInColumn(
    column: ActionStatus,
    fromPosition: number,
    increment: number,
    tx?: unknown,
  ): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.kanbanOrder.updateMany({
      where: {
        column,
        position: { gte: fromPosition },
      },
      data: {
        position: { increment },
        sortOrder: { increment },
      },
    });
  }

  async updateActionsPositionInRange(
    column: ActionStatus,
    minPosition: number,
    maxPosition: number,
    increment: number,
    tx?: unknown,
  ): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.kanbanOrder.updateMany({
      where: {
        column,
        position: {
          gte: minPosition,
          lte: maxPosition,
        },
      },
      data: {
        position: { increment },
        sortOrder: { increment },
      },
    });
  }

  async findKanbanOrderByActionId(
    actionId: string,
    tx?: unknown,
  ): Promise<{
    column: ActionStatus;
    position: number;
    lastMovedAt: Date;
  } | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const kanbanOrder = await client.kanbanOrder.findUnique({
      where: { actionId },
      select: {
        column: true,
        position: true,
        lastMovedAt: true,
      },
    });

    if (!kanbanOrder) {
      return null;
    }

    return {
      column: kanbanOrder.column as ActionStatus,
      position: kanbanOrder.position,
      lastMovedAt: kanbanOrder.lastMovedAt,
    };
  }

  async findFullKanbanOrderByActionId(
    actionId: string,
    tx?: unknown,
  ): Promise<{
    id: string;
    actionId: string;
    column: ActionStatus;
    position: number;
    sortOrder: number;
    lastMovedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const kanbanOrder = await client.kanbanOrder.findUnique({
      where: { actionId },
    });

    if (!kanbanOrder) {
      return null;
    }

    return {
      id: kanbanOrder.id,
      actionId: kanbanOrder.actionId,
      column: kanbanOrder.column as ActionStatus,
      position: kanbanOrder.position,
      sortOrder: kanbanOrder.sortOrder,
      lastMovedAt: kanbanOrder.lastMovedAt,
      createdAt: kanbanOrder.createdAt,
      updatedAt: kanbanOrder.updatedAt,
    };
  }

  async updateWithKanbanOrder(
    actionId: string,
    actionData: Partial<UpdateActionData>,
    kanbanData: {
      column: ActionStatus;
      position: number;
    },
    tx?: unknown,
  ): Promise<Action> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const updated = await client.action.update({
      where: { id: actionId },
      data: {
        title: actionData.title,
        description: actionData.description,
        status: actionData.status,
        priority: actionData.priority,
        estimatedStartDate: actionData.estimatedStartDate,
        estimatedEndDate: actionData.estimatedEndDate,
        actualStartDate: actionData.actualStartDate,
        actualEndDate: actionData.actualEndDate,
        isLate: actionData.isLate,
        isBlocked: actionData.isBlocked,
        blockedReason: actionData.blockedReason,
        responsibleId: actionData.responsibleId,
        teamId: actionData.teamId,
        kanbanOrder: {
          upsert: {
            create: {
              column: kanbanData.column,
              position: kanbanData.position,
              sortOrder: kanbanData.position,
              lastMovedAt: new Date(),
            },
            update: {
              column: kanbanData.column,
              position: kanbanData.position,
              sortOrder: kanbanData.position,
              lastMovedAt: new Date(),
            },
          },
        },
      },
      include: {
        kanbanOrder: true,
      },
    });

    return this.mapToDomain(updated);
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

  private mapChecklistItemToDomain(
    prismaItem: PrismaChecklistItem,
  ): ChecklistItem {
    return new ChecklistItem(
      prismaItem.id,
      prismaItem.actionId,
      prismaItem.description,
      prismaItem.isCompleted,
      prismaItem.completedAt,
      prismaItem.order,
    );
  }
}

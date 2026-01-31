import { Action } from '@/core/domain/action/action.entity';
import { ChecklistItem } from '@/core/domain/action/checklist-item.entity';
import {
  ActionLateStatus,
  ActionPriority,
  ActionStatus,
} from '@/core/domain/shared/enums';

export interface ActionFilters {
  status?: ActionStatus | ActionStatus[];
  priority?: ActionPriority;
  responsibleId?: string;
  teamId?: string;
  lateStatus?: ActionLateStatus | ActionLateStatus[];
  isLate?: boolean;
  isBlocked?: boolean;
  includeDeleted?: boolean;
}

export interface UpdateActionData {
  rootCause?: string;
  title?: string;
  description?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  isLate?: boolean;
  isBlocked?: boolean;
  blockedReason?: string | null;
  responsibleId?: string;
  teamId?: string | null;
}

import { KanbanOrder as PrismaKanbanOrder } from '@prisma/client';

export interface ActionResponsibleUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ActionWithChecklistItems {
  action: Action;
  checklistItems: ChecklistItem[];
  kanbanOrder: PrismaKanbanOrder | null;
  responsible?: ActionResponsibleUser;
  lateStatus: ActionLateStatus | null;
  createdAt: Date;
}

export interface ActionRepository {
  create(action: Action, tx?: unknown): Promise<Action>;
  findById(
    id: string,
    includeDeleted?: boolean,
    tx?: unknown,
  ): Promise<Action | null>;
  findByIdWithChecklistItems(
    id: string,
    includeDeleted?: boolean,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems | null>;
  findByCompanyId(
    companyId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]>;
  findByCompanyIdWithChecklistItems(
    companyId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems[]>;
  findByTeamId(
    teamId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]>;
  findByTeamIdWithChecklistItems(
    teamId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems[]>;
  findByResponsibleId(
    responsibleId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]>;
  findByResponsibleIdWithChecklistItems(
    responsibleId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<ActionWithChecklistItems[]>;
  update(
    id: string,
    data: Partial<UpdateActionData>,
    tx?: unknown,
  ): Promise<Action>;
  softDelete(id: string, tx?: unknown): Promise<Action>;
  delete(id: string, tx?: unknown): Promise<void>;
  findLastKanbanOrderInColumn(
    column: ActionStatus,
    tx?: unknown,
  ): Promise<{ position: number } | null>;
  createWithKanbanOrder(
    action: Action,
    column: ActionStatus,
    position: number,
    tx?: unknown,
  ): Promise<Action>;
  updateActionsPositionInColumn(
    column: ActionStatus,
    fromPosition: number,
    increment: number,
    tx?: unknown,
  ): Promise<void>;
  updateActionsPositionInRange(
    column: ActionStatus,
    minPosition: number,
    maxPosition: number,
    increment: number,
    tx?: unknown,
  ): Promise<void>;
  findKanbanOrderByActionId(
    actionId: string,
    tx?: unknown,
  ): Promise<{
    column: ActionStatus;
    position: number;
    lastMovedAt: Date;
  } | null>;
  findFullKanbanOrderByActionId(
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
  } | null>;
  updateWithKanbanOrder(
    actionId: string,
    actionData: Partial<UpdateActionData>,
    kanbanData: {
      column: ActionStatus;
      position: number;
    },
    tx?: unknown,
  ): Promise<Action>;
}

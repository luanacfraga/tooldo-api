import { Action } from '@/core/domain/action';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';

export interface ActionFilters {
  status?: ActionStatus;
  priority?: ActionPriority;
  responsibleId?: string;
  teamId?: string;
  isLate?: boolean;
  isBlocked?: boolean;
  includeDeleted?: boolean;
}

export interface UpdateActionData {
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

export interface ActionRepository {
  create(action: Action, tx?: unknown): Promise<Action>;
  findById(
    id: string,
    includeDeleted?: boolean,
    tx?: unknown,
  ): Promise<Action | null>;
  findByCompanyId(
    companyId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]>;
  findByTeamId(
    teamId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]>;
  findByResponsibleId(
    responsibleId: string,
    filters?: ActionFilters,
    tx?: unknown,
  ): Promise<Action[]>;
  update(
    id: string,
    data: Partial<UpdateActionData>,
    tx?: unknown,
  ): Promise<Action>;
  softDelete(id: string, tx?: unknown): Promise<Action>;
  delete(id: string, tx?: unknown): Promise<void>;
}

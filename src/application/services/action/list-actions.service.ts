import { Action } from '@/core/domain/action';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type {
  ActionRepository,
  ActionWithChecklistItems,
} from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListActionsInput {
  companyId?: string;
  teamId?: string;
  responsibleId?: string;
  creatorId?: string;
  status?: ActionStatus;
  statuses?: ActionStatus[];
  priority?: ActionPriority;
  isLate?: boolean;
  isBlocked?: boolean;
  dateFrom?: string;
  dateTo?: string;
  dateFilterType?: 'createdAt' | 'startDate';
  q?: string;
  objective?: string;
  page?: number;
  limit?: number;
}

export interface ListActionsOutput {
  results: ActionWithChecklistItems[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable()
export class ListActionsService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
  ) {}

  async execute(input: ListActionsInput): Promise<ListActionsOutput> {
    let results: ActionWithChecklistItems[];

    if (input.companyId) {
      const company = await this.companyRepository.findById(input.companyId);
      if (!company) {
        throw new EntityNotFoundException('Empresa', input.companyId);
      }

      results = await this.actionRepository.findByCompanyIdWithChecklistItems(
        input.companyId,
        {
          status: input.statuses?.length ? undefined : input.status,
          priority: input.priority,
          teamId: input.teamId,
          responsibleId: input.responsibleId,
          isBlocked: input.isBlocked,
        },
      );
    } else if (input.teamId) {
      const team = await this.teamRepository.findById(input.teamId);
      if (!team) {
        throw new EntityNotFoundException('Equipe', input.teamId);
      }

      results = await this.actionRepository.findByTeamIdWithChecklistItems(
        input.teamId,
        {
          status: input.statuses?.length ? undefined : input.status,
          priority: input.priority,
          responsibleId: input.responsibleId,
          isBlocked: input.isBlocked,
        },
      );
    } else if (input.responsibleId) {
      results =
        await this.actionRepository.findByResponsibleIdWithChecklistItems(
          input.responsibleId,
          {
            status: input.statuses?.length ? undefined : input.status,
            priority: input.priority,
            isBlocked: input.isBlocked,
          },
        );
    } else {
      results = [];
    }

    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    // Inspirado no weedu-api: calcula isLate dinamicamente (não depende do valor persistido)
    // e só então aplica o filtro isLate.
    const now = new Date();
    let mapped = results.map((r) => ({
      ...r,
      action: this.withDynamicIsLate(r.action, now),
    }));

    if (input.isLate !== undefined) {
      mapped = mapped.filter((r) => r.action.isLate === input.isLate);
    }

    if (input.creatorId) {
      mapped = mapped.filter((r) => r.action.creatorId === input.creatorId);
    }

    const q = input.q?.trim().toLowerCase();
    if (q) {
      mapped = mapped.filter((r) => {
        const haystack =
          `${r.action.title ?? ''} ${r.action.description ?? ''}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    const objectiveFilter = input.objective?.trim().toLowerCase();
    if (objectiveFilter) {
      mapped = mapped.filter((r) => {
        const objective = this.extractObjectiveFromDescription(
          r.action.description,
        )?.toLowerCase();
        if (!objective) {
          return false;
        }
        return objective.includes(objectiveFilter);
      });
    }

    if (input.statuses?.length) {
      const set = new Set(input.statuses);
      mapped = mapped.filter((r) => set.has(r.action.status));
    }

    // Date range filtering
    if (input.dateFrom || input.dateTo) {
      const dateFilterType = input.dateFilterType ?? 'createdAt';

      mapped = mapped.filter((r) => {
        // Get the date to compare based on filter type
        const compareDate =
          dateFilterType === 'createdAt'
            ? r.createdAt
            : r.action.estimatedStartDate;

        // Apply from date filter
        if (input.dateFrom) {
          const fromDate = new Date(input.dateFrom);
          if (compareDate < fromDate) {
            return false;
          }
        }

        // Apply to date filter
        if (input.dateTo) {
          const toDate = new Date(input.dateTo);
          if (compareDate > toDate) {
            return false;
          }
        }

        return true;
      });
    }

    const total = mapped.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const hasNextPage = totalPages > 0 && page < totalPages;
    const hasPreviousPage = totalPages > 0 && page > 1;

    const start = (page - 1) * limit;
    const paginated = mapped.slice(start, start + limit);

    return {
      results: paginated,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }

  private withDynamicIsLate(action: Action, now: Date): Action {
    const isLate = action.calculateIsLate(now);
    if (isLate === action.isLate) {
      return action;
    }
    return new Action(
      action.id,
      action.title,
      action.description,
      action.status,
      action.priority,
      action.estimatedStartDate,
      action.estimatedEndDate,
      action.actualStartDate,
      action.actualEndDate,
      isLate,
      action.isBlocked,
      action.blockedReason,
      action.companyId,
      action.teamId,
      action.creatorId,
      action.responsibleId,
      action.deletedAt,
    );
  }

  /**
   * Extracts ToolDo objective from the description metadata block:
   * [[tooldo-meta]]
   * objective: <value>
   * objectiveDue: <YYYY-MM-DD>
   * [[/tooldo-meta]]
   */
  private extractObjectiveFromDescription(
    description?: string,
  ): string | undefined {
    const raw = description ?? '';
    const start = raw.indexOf('[[tooldo-meta]]');
    const end = raw.indexOf('[[/tooldo-meta]]');
    if (start !== -1 && end !== -1 && end >= start) {
      const inside = raw.slice(start + '[[tooldo-meta]]'.length, end).trim();
      const lines = inside.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          continue;
        }
        const [k, ...rest] = trimmed.split(':');
        const key = (k ?? '').trim().toLowerCase();
        if (key !== 'objective') {
          continue;
        }
        const value = rest.join(':').trim();
        if (!value) {
          return undefined;
        }
        return value.replace(/\s+/g, ' ');
      }
    }

    const legacy = raw.match(/(?:^|\n)\s*objetivo\s*:\s*(.+)\s*$/im);
    const legacyObjective = legacy?.[1]?.trim();
    if (legacyObjective) {
      return legacyObjective.replace(/\s+/g, ' ');
    }

    return undefined;
  }
}

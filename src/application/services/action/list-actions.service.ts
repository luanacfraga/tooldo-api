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
  status?: ActionStatus;
  priority?: ActionPriority;
  isLate?: boolean;
  isBlocked?: boolean;
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
          status: input.status,
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
          status: input.status,
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
            status: input.status,
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
}

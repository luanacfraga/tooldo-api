import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { Inject, Injectable } from '@nestjs/common';

export type CompanyDashboardSummaryActionItem = {
  id: string;
  title: string;
  status: ActionStatus;
  isLate: boolean;
  isBlocked: boolean;
  estimatedEndDate: Date;
};

export type CompanyDashboardSummary = {
  companyId: string;
  totals: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    late: number;
    blocked: number;
  };
  completionRate: number; // 0..100
  focusNow: CompanyDashboardSummaryActionItem[];
  nextSteps: CompanyDashboardSummaryActionItem[];
};

@Injectable()
export class GetCompanyDashboardSummaryService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: { companyId: string }): Promise<CompanyDashboardSummary> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    // NOTE:
    // We intentionally compute `isLate` dynamically (same approach as ListActionsService),
    // so the dashboard remains correct even if the persisted column gets stale.
    const now = new Date();
    const actions = await this.actionRepository.findByCompanyId(input.companyId);

    const normalized = actions
      .filter((a) => !a.isDeleted())
      .map((a) => ({
        action: a,
        isLate: a.calculateIsLate(now),
      }));

    const todo = normalized.filter((a) => a.action.status === ActionStatus.TODO);
    const inProgress = normalized.filter(
      (a) => a.action.status === ActionStatus.IN_PROGRESS,
    );
    const done = normalized.filter((a) => a.action.status === ActionStatus.DONE);
    const blocked = normalized.filter((a) => a.action.isBlocked);
    const late = normalized.filter((a) => a.isLate);

    const total = normalized.length;
    const completionRate = total > 0 ? (done.length / total) * 100 : 0;

    // "Motivational" lists: keep it simple and deterministic.
    // - focusNow: IN_PROGRESS, sorted by closest deadline first
    // - nextSteps: TODO, sorted by closest deadline first
    const focusNow = inProgress
      .slice()
      .sort((a, b) => a.action.estimatedEndDate.getTime() - b.action.estimatedEndDate.getTime())
      .slice(0, 3)
      .map((a) => ({
        id: a.action.id,
        title: a.action.title,
        status: a.action.status,
        isLate: a.isLate,
        isBlocked: a.action.isBlocked,
        estimatedEndDate: a.action.estimatedEndDate,
      }));

    const nextSteps = todo
      .slice()
      .sort((a, b) => a.action.estimatedEndDate.getTime() - b.action.estimatedEndDate.getTime())
      .slice(0, 3)
      .map((a) => ({
        id: a.action.id,
        title: a.action.title,
        status: a.action.status,
        isLate: a.isLate,
        isBlocked: a.action.isBlocked,
        estimatedEndDate: a.action.estimatedEndDate,
      }));

    return {
      companyId: input.companyId,
      totals: {
        total,
        todo: todo.length,
        inProgress: inProgress.length,
        done: done.length,
        late: late.length,
        blocked: blocked.length,
      },
      completionRate,
      focusNow,
      nextSteps,
    };
  }
}



import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';

type DoneTrendPoint = { date: string; done: number };

function assertValidDate(value: string, name: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`${name} inválido`);
  }
  return d;
}

function startOfDayUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUtc(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toYmdUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isBetweenInclusive(date: Date, from: Date, to: Date): boolean {
  return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
}

function priorityWeight(p: ActionPriority): number {
  switch (p) {
    case ActionPriority.URGENT:
      return 4;
    case ActionPriority.HIGH:
      return 3;
    case ActionPriority.MEDIUM:
      return 2;
    case ActionPriority.LOW:
      return 1;
  }
}

export type ExecutorDashboardNextAction = {
  id: string;
  title: string;
  status: ActionStatus;
  priority: ActionPriority;
  isLate: boolean;
  isBlocked: boolean;
  estimatedEndDate: Date;
};

export type ExecutorDashboardTeamContext = {
  teamId: string;
  rank: number;
  totalMembers: number;
  myDone: number;
  averageDone: number;
  percentDiffFromAverage: number; // -100..+inf
};

export type ExecutorDashboardResponse = {
  companyId: string;
  userId: string;
  period: {
    from: string;
    to: string;
    previousFrom: string;
    previousTo: string;
  };
  totals: {
    total: number;
    todo: number;
    inProgress: number;
    done: number;
    late: number;
    blocked: number;
  };
  completionRate: number; // 0..100
  doneInPeriod: {
    current: number;
    previous: number;
    delta: number;
  };
  doneTrend: {
    current: DoneTrendPoint[];
    previous: DoneTrendPoint[];
  };
  nextActions: ExecutorDashboardNextAction[];
  team: ExecutorDashboardTeamContext | null;
};

@Injectable()
export class GetExecutorDashboardService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  async execute(input: {
    companyId: string;
    userId: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<ExecutorDashboardResponse> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    const from = assertValidDate(input.dateFrom, 'dateFrom');
    const to = assertValidDate(input.dateTo, 'dateTo');
    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('dateFrom deve ser menor ou igual a dateTo');
    }

    // Normalize to UTC day boundaries for trends/comparisons (emails/dashboard-like behavior).
    const fromDay = startOfDayUtc(from);
    const toDay = startOfDayUtc(to);

    const days = Math.max(
      1,
      Math.round((toDay.getTime() - fromDay.getTime()) / (24 * 60 * 60 * 1000)) + 1,
    );
    const prevToDay = addDaysUtc(fromDay, -1);
    const prevFromDay = addDaysUtc(prevToDay, -(days - 1));

    const now = new Date();

    const myActions = await this.actionRepository.findByCompanyId(input.companyId, {
      responsibleId: input.userId,
    });

    const normalized = myActions
      .filter((a) => !a.isDeleted())
      .map((a) => ({ action: a, isLate: a.calculateIsLate(now) }));

    const todo = normalized.filter((a) => a.action.status === ActionStatus.TODO);
    const inProgress = normalized.filter(
      (a) => a.action.status === ActionStatus.IN_PROGRESS,
    );
    const done = normalized.filter((a) => a.action.status === ActionStatus.DONE);
    const blocked = normalized.filter((a) => a.action.isBlocked);
    const late = normalized.filter((a) => a.isLate);

    const total = normalized.length;
    const completionRate = total > 0 ? (done.length / total) * 100 : 0;

    const doneInRange = (a: (typeof normalized)[number], fromD: Date, toD: Date) => {
      if (a.action.status !== ActionStatus.DONE) return false;
      const end = a.action.actualEndDate ?? a.action.estimatedEndDate;
      return isBetweenInclusive(end, fromD, addDaysUtc(toD, 1)); // inclusive end-of-day-ish
    };

    const doneCurrent = normalized.filter((a) => doneInRange(a, fromDay, toDay))
      .length;
    const donePrevious = normalized.filter((a) =>
      doneInRange(a, prevFromDay, prevToDay),
    ).length;

    const buildTrend = (fromD: Date, toD: Date): DoneTrendPoint[] => {
      const buckets: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const key = toYmdUtc(addDaysUtc(fromD, i));
        buckets[key] = 0;
      }
      for (const a of normalized) {
        if (a.action.status !== ActionStatus.DONE) continue;
        const end = a.action.actualEndDate ?? a.action.estimatedEndDate;
        const dayKey = toYmdUtc(startOfDayUtc(end));
        if (buckets[dayKey] !== undefined && isBetweenInclusive(end, fromD, addDaysUtc(toD, 1))) {
          buckets[dayKey] += 1;
        }
      }
      return Object.entries(buckets).map(([date, doneCount]) => ({
        date,
        done: doneCount,
      }));
    };

    const nextActions = normalized
      .filter(
        (a) =>
          a.action.status === ActionStatus.TODO ||
          a.action.status === ActionStatus.IN_PROGRESS,
      )
      .slice()
      .sort((a, b) => {
        if (a.isLate !== b.isLate) return a.isLate ? -1 : 1;
        const pw = priorityWeight(b.action.priority) - priorityWeight(a.action.priority);
        if (pw !== 0) return pw;
        return (
          a.action.estimatedEndDate.getTime() - b.action.estimatedEndDate.getTime()
        );
      })
      .slice(0, 5)
      .map((a) => ({
        id: a.action.id,
        title: a.action.title,
        status: a.action.status,
        priority: a.action.priority,
        isLate: a.isLate,
        isBlocked: a.action.isBlocked,
        estimatedEndDate: a.action.estimatedEndDate,
      }));

    // Team context (optional)
    const teamUser = await this.teamUserRepository.findByUserId(input.userId);
    let team: ExecutorDashboardTeamContext | null = null;

    if (teamUser) {
      const teamEntity = await this.teamRepository.findById(teamUser.teamId);
      if (teamEntity && teamEntity.companyId === input.companyId) {
        const teamUsers = await this.teamUserRepository.findByTeamId(teamEntity.id);
        const memberIds = teamUsers.map((tu) => tu.userId);

        const teamActions = await this.actionRepository.findByTeamId(teamEntity.id);
        const teamDone = teamActions
          .filter((a) => !a.isDeleted())
          .filter((a) => a.status === ActionStatus.DONE)
          .filter((a) => {
            const end = a.actualEndDate ?? a.estimatedEndDate;
            return isBetweenInclusive(end, fromDay, addDaysUtc(toDay, 1));
          });

        const counts = new Map<string, number>();
        for (const userId of memberIds) counts.set(userId, 0);
        for (const a of teamDone) {
          counts.set(a.responsibleId, (counts.get(a.responsibleId) ?? 0) + 1);
        }

        const ranked = [...counts.entries()].sort((a, b) => {
          const diff = (b[1] ?? 0) - (a[1] ?? 0);
          if (diff !== 0) return diff;
          return a[0].localeCompare(b[0]);
        });

        const totalMembers = ranked.length;
        const myDone = counts.get(input.userId) ?? 0;
        const rankIndex = ranked.findIndex(([id]) => id === input.userId);
        const rank = rankIndex >= 0 ? rankIndex + 1 : totalMembers;
        const sum = ranked.reduce((acc, [, v]) => acc + (v ?? 0), 0);
        const averageDone = totalMembers > 0 ? sum / totalMembers : 0;
        const percentDiffFromAverage =
          averageDone > 0 ? ((myDone - averageDone) / averageDone) * 100 : 0;

        team = {
          teamId: teamEntity.id,
          rank,
          totalMembers,
          myDone,
          averageDone,
          percentDiffFromAverage,
        };
      }
    }

    return {
      companyId: input.companyId,
      userId: input.userId,
      period: {
        from: input.dateFrom,
        to: input.dateTo,
        previousFrom: prevFromDay.toISOString(),
        previousTo: prevToDay.toISOString(),
      },
      totals: {
        total,
        todo: todo.length,
        inProgress: inProgress.length,
        done: done.length,
        late: late.length,
        blocked: blocked.length,
      },
      completionRate,
      doneInPeriod: {
        current: doneCurrent,
        previous: donePrevious,
        delta: doneCurrent - donePrevious,
      },
      doneTrend: {
        current: buildTrend(fromDay, toDay),
        previous: buildTrend(prevFromDay, prevToDay),
      },
      nextActions,
      team,
    };
  }
}



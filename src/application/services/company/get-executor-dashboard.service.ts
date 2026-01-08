import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
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
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
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

export type ImpactCategory =
  | 'receita'
  | 'cliente'
  | 'eficiencia'
  | 'qualidade'
  | 'risco'
  | 'pessoas'
  | 'outro'
  | 'nao-informado';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

function parseObjectiveAndImpact(description: string | null | undefined): {
  objective?: string;
  impact?: string;
} {
  const text = description ?? '';
  if (!text) {
    return {};
  }

  // Preferred format (stored by the frontend ActionForm):
  // [[tooldo-meta]]
  // objective: <value>
  // objectiveDue: <YYYY-MM-DD>
  // [[/tooldo-meta]]
  const start = text.indexOf('[[tooldo-meta]]');
  const end = text.indexOf('[[/tooldo-meta]]');
  let objective: string | undefined;
  if (start !== -1 && end !== -1 && end >= start) {
    const inside = text.slice(start + '[[tooldo-meta]]'.length, end).trim();
    for (const line of inside.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      const [k, ...rest] = trimmed.split(':');
      const key = (k ?? '').trim().toLowerCase();
      const value = rest.join(':').trim();
      if (!value) {
        continue;
      }
      if (key === 'objective') {
        objective = value;
      }
    }
  }

  // Legacy free-text format used in movement notes / older descriptions
  const objectiveMatch = text.match(/(?:^|\n)\s*objetivo\s*:\s*(.+)\s*$/im);
  const impactMatch = text.match(/(?:^|\n)\s*impacto\s*:\s*(.+)\s*$/im);

  const legacyObjective = objectiveMatch?.[1]?.trim();
  const impact = impactMatch?.[1]?.trim();

  return {
    objective: objective?.trim() ?? legacyObjective ?? undefined,
    impact: impact ?? undefined,
  };
}

function mapImpactCategory(raw: string | undefined): ImpactCategory {
  if (!raw) {
    return 'nao-informado';
  }
  const v = normalizeText(raw);

  if (v.includes('receita') || v.includes('vendas') || v.includes('fatur')) {
    return 'receita';
  }
  if (v.includes('cliente') || v.includes('nps') || v.includes('satisf')) {
    return 'cliente';
  }
  if (v.includes('eficien') || v.includes('tempo') || v.includes('produt')) {
    return 'eficiencia';
  }
  if (v.includes('qualid') || v.includes('bug') || v.includes('incidente')) {
    return 'qualidade';
  }
  if (v.includes('risco') || v.includes('compliance') || v.includes('multa')) {
    return 'risco';
  }
  if (v.includes('pessoas') || v.includes('rh') || v.includes('cultura')) {
    return 'pessoas';
  }
  if (v.includes('outro')) {
    return 'outro';
  }

  return 'outro';
}

export type ExecutorDashboardNextAction = {
  id: string;
  title: string;
  status: ActionStatus;
  priority: ActionPriority;
  isLate: boolean;
  isBlocked: boolean;
  blockedReason?: string | null;
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
  todayTop3: ExecutorDashboardNextAction[];
  blockedActions: ExecutorDashboardNextAction[];
  impact: {
    categories: Record<ImpactCategory, number>;
    topObjectives: Array<{ objective: string; count: number }>;
  };
  quality: {
    doneOnTime: number;
    doneLate: number;
    reopened: number;
    avgCycleTimeHours: number | null;
    avgInProgressAgeHours: number | null;
    blockedRatePercent: number; // 0..100
  };
  nextActions: ExecutorDashboardNextAction[];
  team: ExecutorDashboardTeamContext | null;
};

@Injectable()
export class GetExecutorDashboardService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('ActionMovementRepository')
    private readonly actionMovementRepository: ActionMovementRepository,
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
    objective?: string;
  }): Promise<ExecutorDashboardResponse> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    const from = assertValidDate(input.dateFrom, 'dateFrom');
    const to = assertValidDate(input.dateTo, 'dateTo');
    if (from.getTime() > to.getTime()) {
      throw new BadRequestException(
        'dateFrom deve ser menor ou igual a dateTo',
      );
    }

    // Normalize to UTC day boundaries for trends/comparisons (emails/dashboard-like behavior).
    const fromDay = startOfDayUtc(from);
    const toDay = startOfDayUtc(to);

    const days = Math.max(
      1,
      Math.round(
        (toDay.getTime() - fromDay.getTime()) / (24 * 60 * 60 * 1000),
      ) + 1,
    );
    const prevToDay = addDaysUtc(fromDay, -1);
    const prevFromDay = addDaysUtc(prevToDay, -(days - 1));

    const now = new Date();

    const myActions = await this.actionRepository.findByCompanyId(
      input.companyId,
      {
        responsibleId: input.userId,
      },
    );

    const objectiveFilter = input.objective?.trim().toLowerCase();
    const normalized = myActions
      .filter((a) => !a.isDeleted())
      .map((a) => ({ action: a, isLate: a.calculateIsLate(now) }))
      .filter((a) => {
        if (!objectiveFilter) {
          return true;
        }
        const meta = parseObjectiveAndImpact(a.action.description);
        const obj = meta.objective?.trim().toLowerCase();
        if (!obj) {
          return false;
        }
        return obj.includes(objectiveFilter);
      });

    const todo = normalized.filter(
      (a) => a.action.status === ActionStatus.TODO,
    );
    const inProgress = normalized.filter(
      (a) => a.action.status === ActionStatus.IN_PROGRESS,
    );
    const done = normalized.filter(
      (a) => a.action.status === ActionStatus.DONE,
    );
    const blocked = normalized.filter((a) => a.action.isBlocked);
    const late = normalized.filter((a) => a.isLate);

    const total = normalized.length;
    const completionRate = total > 0 ? (done.length / total) * 100 : 0;

    const doneInRange = (
      a: (typeof normalized)[number],
      fromD: Date,
      toD: Date,
    ) => {
      if (a.action.status !== ActionStatus.DONE) {
        return false;
      }
      const end = a.action.actualEndDate ?? a.action.estimatedEndDate;
      return isBetweenInclusive(end, fromD, addDaysUtc(toD, 1)); // inclusive end-of-day-ish
    };

    const doneCurrent = normalized.filter((a) =>
      doneInRange(a, fromDay, toDay),
    ).length;
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
        if (a.action.status !== ActionStatus.DONE) {
          continue;
        }
        const end = a.action.actualEndDate ?? a.action.estimatedEndDate;
        const dayKey = toYmdUtc(startOfDayUtc(end));
        if (
          buckets[dayKey] !== undefined &&
          isBetweenInclusive(end, fromD, addDaysUtc(toD, 1))
        ) {
          buckets[dayKey] += 1;
        }
      }
      return Object.entries(buckets).map(([date, doneCount]) => ({
        date,
        done: doneCount,
      }));
    };

    const doneCurrentItems = normalized.filter((a) =>
      doneInRange(a, fromDay, toDay),
    );

    const doneOnTime = doneCurrentItems.filter((a) => {
      const end = a.action.actualEndDate ?? a.action.estimatedEndDate;
      return end.getTime() <= a.action.estimatedEndDate.getTime();
    }).length;
    const doneLateCount = Math.max(0, doneCurrent - doneOnTime);

    const avgCycleTimeHours = (() => {
      const durationsMs = doneCurrentItems
        .map((a) => {
          const start = a.action.actualStartDate ?? a.action.estimatedStartDate;
          const end = a.action.actualEndDate ?? a.action.estimatedEndDate;
          const ms = end.getTime() - start.getTime();
          return ms > 0 ? ms : null;
        })
        .filter((v): v is number => typeof v === 'number');
      if (!durationsMs.length) {
        return null;
      }
      const avgMs =
        durationsMs.reduce((acc, v) => acc + v, 0) / durationsMs.length;
      return Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;
    })();

    const avgInProgressAgeHours = (() => {
      const agesMs = inProgress
        .map((a) => {
          const start = a.action.actualStartDate ?? a.action.estimatedStartDate;
          const ms = now.getTime() - start.getTime();
          return ms > 0 ? ms : null;
        })
        .filter((v): v is number => typeof v === 'number');
      if (!agesMs.length) {
        return null;
      }
      const avgMs = agesMs.reduce((acc, v) => acc + v, 0) / agesMs.length;
      return Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;
    })();

    const blockedRatePercent = total > 0 ? (blocked.length / total) * 100 : 0;

    const doneCurrentIds = doneCurrentItems.map((a) => a.action.id);
    const endExclusive = addDaysUtc(toDay, 1);
    const movementsByActionId = new Map<
      string,
      Awaited<ReturnType<ActionMovementRepository['findByActionId']>>
    >();
    await Promise.all(
      doneCurrentIds.map(async (id) => {
        movementsByActionId.set(
          id,
          await this.actionMovementRepository.findByActionId(id),
        );
      }),
    );

    const reopened = doneCurrentIds.filter((id) => {
      const movements = movementsByActionId.get(id) ?? [];
      return movements.some(
        (m) =>
          m.fromStatus === ActionStatus.DONE &&
          m.toStatus !== ActionStatus.DONE &&
          isBetweenInclusive(m.movedAt, fromDay, endExclusive),
      );
    }).length;

    const impactCategories: Record<ImpactCategory, number> = {
      receita: 0,
      cliente: 0,
      eficiencia: 0,
      qualidade: 0,
      risco: 0,
      pessoas: 0,
      outro: 0,
      'nao-informado': 0,
    };
    const objectiveCounts = new Map<string, number>();
    for (const a of doneCurrentItems) {
      const movements = movementsByActionId.get(a.action.id) ?? [];
      const doneMove = movements.find(
        (m) =>
          m.toStatus === ActionStatus.DONE &&
          isBetweenInclusive(m.movedAt, fromDay, endExclusive),
      );
      const parsed = parseObjectiveAndImpact(doneMove?.notes);
      impactCategories[mapImpactCategory(parsed.impact)] += 1;
      if (parsed.objective) {
        objectiveCounts.set(
          parsed.objective,
          (objectiveCounts.get(parsed.objective) ?? 0) + 1,
        );
      }
    }
    const topObjectives = [...objectiveCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([objective, count]) => ({ objective, count }));

    const nextActions = normalized
      .filter(
        (a) =>
          a.action.status === ActionStatus.TODO ||
          a.action.status === ActionStatus.IN_PROGRESS,
      )
      .slice()
      .sort((a, b) => {
        if (a.isLate !== b.isLate) {
          return a.isLate ? -1 : 1;
        }
        const pw =
          priorityWeight(b.action.priority) - priorityWeight(a.action.priority);
        if (pw !== 0) {
          return pw;
        }
        return (
          a.action.estimatedEndDate.getTime() -
          b.action.estimatedEndDate.getTime()
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
        blockedReason: a.action.blockedReason,
        estimatedEndDate: a.action.estimatedEndDate,
      }));

    const todayTop3 = nextActions.slice(0, 3);

    const blockedActions = normalized
      .filter((a) => a.action.isBlocked)
      .slice()
      .sort(
        (a, b) =>
          a.action.estimatedEndDate.getTime() -
          b.action.estimatedEndDate.getTime(),
      )
      .slice(0, 5)
      .map((a) => ({
        id: a.action.id,
        title: a.action.title,
        status: a.action.status,
        priority: a.action.priority,
        isLate: a.isLate,
        isBlocked: a.action.isBlocked,
        blockedReason: a.action.blockedReason,
        estimatedEndDate: a.action.estimatedEndDate,
      }));

    // Team context (optional)
    const teamUser = await this.teamUserRepository.findByUserId(input.userId);
    let team: ExecutorDashboardTeamContext | null = null;

    if (teamUser) {
      const teamEntity = await this.teamRepository.findById(teamUser.teamId);
      if (teamEntity?.companyId === input.companyId) {
        const teamUsers = await this.teamUserRepository.findByTeamId(
          teamEntity.id,
        );
        const memberIds = teamUsers.map((tu) => tu.userId);

        const teamActions = await this.actionRepository.findByTeamId(
          teamEntity.id,
        );
        const teamDone = teamActions
          .filter((a) => !a.isDeleted())
          .filter((a) => a.status === ActionStatus.DONE)
          .filter((a) => {
            const end = a.actualEndDate ?? a.estimatedEndDate;
            return isBetweenInclusive(end, fromDay, addDaysUtc(toDay, 1));
          });

        const counts = new Map<string, number>();
        for (const userId of memberIds) {
          counts.set(userId, 0);
        }
        for (const a of teamDone) {
          counts.set(a.responsibleId, (counts.get(a.responsibleId) ?? 0) + 1);
        }

        const ranked = [...counts.entries()].sort((a, b) => {
          const diff = (b[1] ?? 0) - (a[1] ?? 0);
          if (diff !== 0) {
            return diff;
          }
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
      todayTop3,
      blockedActions,
      impact: {
        categories: impactCategories,
        topObjectives,
      },
      quality: {
        doneOnTime,
        doneLate: doneLateCount,
        reopened,
        avgCycleTimeHours,
        avgInProgressAgeHours,
        blockedRatePercent: Math.round(blockedRatePercent * 10) / 10,
      },
      nextActions,
      team,
    };
  }
}

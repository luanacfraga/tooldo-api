import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';

type ImpactCategory =
  | 'receita'
  | 'cliente'
  | 'eficiencia'
  | 'qualidade'
  | 'risco'
  | 'pessoas'
  | 'outro'
  | 'nao-informado';

class ExecutorDashboardTotalsDto {
  @ApiProperty({ example: 10 })
  total!: number;

  @ApiProperty({ example: 4 })
  todo!: number;

  @ApiProperty({ example: 3 })
  inProgress!: number;

  @ApiProperty({ example: 3 })
  done!: number;

  @ApiProperty({ example: 1 })
  late!: number;

  @ApiProperty({ example: 2 })
  blocked!: number;
}

class ExecutorDashboardPeriodDto {
  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  from!: string;

  @ApiProperty({ example: '2026-01-07T23:59:59.999Z' })
  to!: string;

  @ApiProperty({ example: '2025-12-25T00:00:00.000Z' })
  previousFrom!: string;

  @ApiProperty({ example: '2025-12-31T23:59:59.999Z' })
  previousTo!: string;
}

class DoneDeltaDto {
  @ApiProperty({ example: 12 })
  current!: number;

  @ApiProperty({ example: 9 })
  previous!: number;

  @ApiProperty({ example: 3 })
  delta!: number;
}

class DoneTrendPointDto {
  @ApiProperty({ example: '2026-01-06' })
  date!: string;

  @ApiProperty({ example: 2 })
  done!: number;
}

class DoneTrendDto {
  @ApiProperty({ type: [DoneTrendPointDto] })
  current!: DoneTrendPointDto[];

  @ApiProperty({ type: [DoneTrendPointDto] })
  previous!: DoneTrendPointDto[];
}

class ExecutorNextActionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Revisar PR #42' })
  title!: string;

  @ApiProperty({ enum: ActionStatus, example: ActionStatus.IN_PROGRESS })
  status!: ActionStatus;

  @ApiProperty({ enum: ActionPriority, example: ActionPriority.HIGH })
  priority!: ActionPriority;

  @ApiProperty({ example: false })
  isLate!: boolean;

  @ApiProperty({ example: false })
  isBlocked!: boolean;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Aguardando aprovação do financeiro',
  })
  blockedReason?: string | null;

  @ApiProperty({ example: '2026-01-06T12:00:00.000Z' })
  estimatedEndDate!: Date;
}

class ImpactCategoriesDto {
  @ApiProperty({ example: 2 })
  receita!: number;
  @ApiProperty({ example: 1 })
  cliente!: number;
  @ApiProperty({ example: 3 })
  eficiencia!: number;
  @ApiProperty({ example: 0 })
  qualidade!: number;
  @ApiProperty({ example: 0 })
  risco!: number;
  @ApiProperty({ example: 1 })
  pessoas!: number;
  @ApiProperty({ example: 0 })
  outro!: number;
  @ApiProperty({ example: 5 })
  ['nao-informado']!: number;
}

class ImpactTopObjectiveDto {
  @ApiProperty({ example: 'Reduzir churn' })
  objective!: string;

  @ApiProperty({ example: 3 })
  count!: number;
}

class ImpactSummaryDto {
  @ApiProperty({ type: ImpactCategoriesDto })
  categories!: Record<ImpactCategory, number>;

  @ApiProperty({ type: [ImpactTopObjectiveDto] })
  topObjectives!: ImpactTopObjectiveDto[];
}

class QualitySummaryDto {
  @ApiProperty({ example: 8 })
  doneOnTime!: number;

  @ApiProperty({ example: 2 })
  doneLate!: number;

  @ApiProperty({ example: 1 })
  reopened!: number;

  @ApiProperty({ example: 6.5, nullable: true })
  avgCycleTimeHours!: number | null;

  @ApiProperty({ example: 12.3, nullable: true })
  avgInProgressAgeHours!: number | null;

  @ApiProperty({ example: 18.2 })
  blockedRatePercent!: number;
}

class ExecutorTeamContextDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  teamId!: string;

  @ApiProperty({ example: 3 })
  rank!: number;

  @ApiProperty({ example: 8 })
  totalMembers!: number;

  @ApiProperty({ example: 12 })
  myDone!: number;

  @ApiProperty({ example: 10.5 })
  averageDone!: number;

  @ApiProperty({ example: 14.28 })
  percentDiffFromAverage!: number;
}

export class ExecutorDashboardResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  companyId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ type: ExecutorDashboardPeriodDto })
  period!: ExecutorDashboardPeriodDto;

  @ApiProperty({ type: ExecutorDashboardTotalsDto })
  totals!: ExecutorDashboardTotalsDto;

  @ApiProperty({ description: 'Taxa de conclusão (0..100)', example: 30 })
  completionRate!: number;

  @ApiProperty({ type: DoneDeltaDto })
  doneInPeriod!: DoneDeltaDto;

  @ApiProperty({ type: DoneTrendDto })
  doneTrend!: DoneTrendDto;

  @ApiProperty({ type: [ExecutorNextActionDto] })
  todayTop3!: ExecutorNextActionDto[];

  @ApiProperty({ type: [ExecutorNextActionDto] })
  blockedActions!: ExecutorNextActionDto[];

  @ApiProperty({ type: ImpactSummaryDto })
  impact!: ImpactSummaryDto;

  @ApiProperty({ type: QualitySummaryDto })
  quality!: QualitySummaryDto;

  @ApiProperty({ type: [ExecutorNextActionDto] })
  nextActions!: ExecutorNextActionDto[];

  @ApiProperty({ type: ExecutorTeamContextDto, nullable: true })
  team!: ExecutorTeamContextDto | null;

  static fromDomain(input: {
    companyId: string;
    userId: string;
    period: ExecutorDashboardPeriodDto;
    totals: ExecutorDashboardTotalsDto;
    completionRate: number;
    doneInPeriod: DoneDeltaDto;
    doneTrend: DoneTrendDto;
    todayTop3: ExecutorNextActionDto[];
    blockedActions: ExecutorNextActionDto[];
    impact: ImpactSummaryDto;
    quality: QualitySummaryDto;
    nextActions: ExecutorNextActionDto[];
    team: ExecutorTeamContextDto | null;
  }): ExecutorDashboardResponseDto {
    const dto = new ExecutorDashboardResponseDto();
    dto.companyId = input.companyId;
    dto.userId = input.userId;
    dto.period = input.period;
    dto.totals = input.totals;
    dto.completionRate = input.completionRate;
    dto.doneInPeriod = input.doneInPeriod;
    dto.doneTrend = input.doneTrend;
    dto.todayTop3 = input.todayTop3;
    dto.blockedActions = input.blockedActions;
    dto.impact = input.impact;
    dto.quality = input.quality;
    dto.nextActions = input.nextActions;
    dto.team = input.team;
    return dto;
  }
}

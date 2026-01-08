import { ActionStatus } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';

class CompanyDashboardSummaryActionItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Entregar landing page' })
  title!: string;

  @ApiProperty({ enum: ActionStatus, example: ActionStatus.IN_PROGRESS })
  status!: ActionStatus;

  @ApiProperty({ example: false })
  isLate!: boolean;

  @ApiProperty({ example: false })
  isBlocked!: boolean;

  @ApiProperty({ example: '2026-01-06T12:00:00.000Z' })
  estimatedEndDate!: Date;
}

class CompanyDashboardSummaryTotalsDto {
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

export class CompanyDashboardSummaryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  companyId!: string;

  @ApiProperty({ type: CompanyDashboardSummaryTotalsDto })
  totals!: CompanyDashboardSummaryTotalsDto;

  @ApiProperty({
    description: 'Taxa de conclusão (0..100)',
    example: 30,
  })
  completionRate!: number;

  @ApiProperty({ type: [CompanyDashboardSummaryActionItemDto] })
  focusNow!: CompanyDashboardSummaryActionItemDto[];

  @ApiProperty({ type: [CompanyDashboardSummaryActionItemDto] })
  nextSteps!: CompanyDashboardSummaryActionItemDto[];

  static fromDomain(input: {
    companyId: string;
    totals: CompanyDashboardSummaryTotalsDto;
    completionRate: number;
    focusNow: CompanyDashboardSummaryActionItemDto[];
    nextSteps: CompanyDashboardSummaryActionItemDto[];
  }): CompanyDashboardSummaryResponseDto {
    const dto = new CompanyDashboardSummaryResponseDto();
    dto.companyId = input.companyId;
    dto.totals = input.totals;
    dto.completionRate = input.completionRate;
    dto.focusNow = input.focusNow;
    dto.nextSteps = input.nextSteps;
    return dto;
  }
}

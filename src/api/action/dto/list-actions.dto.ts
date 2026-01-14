import {
  ActionLateStatus,
  ActionPriority,
  ActionStatus,
} from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListActionsQueryDto {
  @ApiProperty({ required: false, description: 'Filtrar por empresa' })
  @IsOptional()
  companyId?: string;

  @ApiProperty({ required: false, description: 'Filtrar por equipe' })
  @IsOptional()
  teamId?: string;

  @ApiProperty({ required: false, description: 'Filtrar por responsável' })
  @IsOptional()
  responsibleId?: string;

  @ApiProperty({ required: false, description: 'Filtrar por criador' })
  @IsOptional()
  creatorId?: string;

  @ApiProperty({
    required: false,
    description: 'Filtrar por status',
    enum: ActionStatus,
  })
  @IsEnum(ActionStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: ActionStatus;

  @ApiProperty({
    required: false,
    description:
      'Filtrar por múltiplos status (use query param repetido: statuses=TODO&statuses=DONE)',
    isArray: true,
    enum: ActionStatus,
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsEnum(ActionStatus, { each: true, message: 'Status inválido' })
  @IsOptional()
  statuses?: ActionStatus[];

  @ApiProperty({
    required: false,
    description: 'Filtrar por prioridade',
    enum: ActionPriority,
  })
  @IsEnum(ActionPriority, { message: 'Prioridade inválida' })
  @IsOptional()
  priority?: ActionPriority;

  @ApiProperty({
    required: false,
    description: 'Filtrar por atrasadas',
    type: Boolean,
  })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isLate deve ser boolean' })
  @IsOptional()
  isLate?: boolean;

  @ApiProperty({
    required: false,
    description: 'Filtrar por tipo de atraso específico',
    enum: ActionLateStatus,
    isArray: true,
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsEnum(ActionLateStatus, { each: true, message: 'Late status inválido' })
  @IsOptional()
  lateStatus?: ActionLateStatus[];

  @ApiProperty({
    required: false,
    description: 'Filtrar por bloqueadas',
    type: Boolean,
  })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isBlocked deve ser boolean' })
  @IsOptional()
  isBlocked?: boolean;

  @ApiProperty({
    required: false,
    description: 'Filtrar por data inicial (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsString({ message: 'dateFrom deve ser string ISO' })
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({
    required: false,
    description: 'Filtrar por data final (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsString({ message: 'dateTo deve ser string ISO' })
  @IsOptional()
  dateTo?: string;

  @ApiProperty({
    required: false,
    description:
      'Tipo de filtro de data: estimatedStartDate (início previsto), actualStartDate (início real), estimatedEndDate (término previsto), actualEndDate (término real) ou createdAt (data de criação)',
    enum: ['estimatedStartDate', 'actualStartDate', 'estimatedEndDate', 'actualEndDate', 'createdAt'],
    example: 'estimatedStartDate',
  })
  @IsEnum(['estimatedStartDate', 'actualStartDate', 'estimatedEndDate', 'actualEndDate', 'createdAt'], {
    message: 'dateFilterType deve ser estimatedStartDate, actualStartDate, estimatedEndDate, actualEndDate ou createdAt',
  })
  @IsOptional()
  dateFilterType?: 'estimatedStartDate' | 'actualStartDate' | 'estimatedEndDate' | 'actualEndDate' | 'createdAt';

  @ApiProperty({
    required: false,
    description: 'Busca por título ou descrição (case-insensitive)',
    example: 'melhorar onboarding',
  })
  @IsString({ message: 'q deve ser string' })
  @IsOptional()
  q?: string;

  @ApiProperty({
    required: false,
    description: 'Página',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser maior ou igual a 1' })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Limite por página',
    example: 20,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Limite deve ser um número inteiro' })
  @Min(1, { message: 'Limite deve ser maior ou igual a 1' })
  @IsOptional()
  limit?: number = 20;
}

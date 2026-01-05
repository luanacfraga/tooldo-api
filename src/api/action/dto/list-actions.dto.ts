import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';

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
    description: 'Filtrar por prioridade',
    enum: ActionPriority,
  })
  @IsEnum(ActionPriority, { message: 'Prioridade inválida' })
  @IsOptional()
  priority?: ActionPriority;

  @ApiProperty({ required: false, description: 'Filtrar por atrasadas', type: Boolean })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isLate deve ser boolean' })
  @IsOptional()
  isLate?: boolean;

  @ApiProperty({ required: false, description: 'Filtrar por bloqueadas', type: Boolean })
  @Type(() => Boolean)
  @IsBoolean({ message: 'isBlocked deve ser boolean' })
  @IsOptional()
  isBlocked?: boolean;

  @ApiProperty({ required: false, description: 'Página', example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser maior ou igual a 1' })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Limite por página', example: 20, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Limite deve ser um número inteiro' })
  @Min(1, { message: 'Limite deve ser maior ou igual a 1' })
  @IsOptional()
  limit?: number = 20;
}



import { ActionPriority } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateActionDto {
  @ApiProperty({
    description: 'Título da ação',
    example: 'Implementar módulo de relatórios',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O título deve ser uma string' })
  title?: string;

  @ApiProperty({
    description: 'Descrição detalhada da ação',
    example: 'Criar funcionalidade para geração de relatórios gerenciais...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  description?: string;

  @ApiProperty({
    description: 'Prioridade da ação',
    enum: ActionPriority,
    example: ActionPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(ActionPriority, {
    message: 'A prioridade deve ser LOW, MEDIUM, HIGH ou URGENT',
  })
  priority?: ActionPriority;

  @ApiProperty({
    description: 'Data estimada de início',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'A data estimada de início deve ser uma data válida' })
  estimatedStartDate?: Date;

  @ApiProperty({
    description: 'Data estimada de término',
    example: '2025-01-15T00:00:00.000Z',
    type: Date,
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'A data estimada de término deve ser uma data válida' })
  estimatedEndDate?: Date;

  @ApiProperty({
    description: 'ID do responsável pela ação',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'O ID do responsável deve ser um UUID válido' })
  responsibleId?: string;

  @ApiProperty({
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'O ID da equipe deve ser um UUID válido' })
  teamId?: string;
}

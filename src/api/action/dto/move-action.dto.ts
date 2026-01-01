import { ActionStatus } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class MoveActionDto {
  @ApiProperty({
    description: 'Novo status da ação',
    enum: ActionStatus,
    example: ActionStatus.IN_PROGRESS,
  })
  @IsEnum(ActionStatus, {
    message: 'O status deve ser TODO, IN_PROGRESS ou DONE',
  })
  toStatus!: ActionStatus;

  @ApiProperty({
    description: 'Posição da ação na coluna do Kanban',
    example: 0,
    required: false,
  })
  @IsInt({ message: 'A posição deve ser um número inteiro' })
  @Min(0, { message: 'A posição deve ser maior ou igual a 0' })
  @IsOptional()
  position?: number;

  @ApiProperty({
    description: 'Observações sobre a movimentação',
    example: 'Iniciando desenvolvimento após aprovação',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'As observações devem ser uma string' })
  notes?: string;
}

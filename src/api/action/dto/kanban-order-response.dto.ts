import { ActionStatus } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';
import { KanbanOrder as PrismaKanbanOrder } from '@prisma/client';

export class KanbanOrderResponseDto {
  @ApiProperty({
    description: 'ID da ordem do Kanban',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Coluna do Kanban (status da ação)',
    enum: ActionStatus,
    example: ActionStatus.IN_PROGRESS,
  })
  column!: ActionStatus;

  @ApiProperty({
    description: 'Posição da ação na coluna',
    example: 0,
  })
  position!: number;

  @ApiProperty({
    description: 'Ordem de classificação',
    example: 1000,
  })
  sortOrder!: number;

  @ApiProperty({
    description: 'Data da última movimentação',
    example: '2025-01-15T10:30:00.000Z',
  })
  lastMovedAt!: Date;

  static fromEntity(kanbanOrder: PrismaKanbanOrder): KanbanOrderResponseDto {
    const response = new KanbanOrderResponseDto();
    response.id = kanbanOrder.id;
    response.column = kanbanOrder.column as ActionStatus;
    response.position = kanbanOrder.position;
    response.sortOrder = kanbanOrder.sortOrder;
    response.lastMovedAt = kanbanOrder.lastMovedAt;
    return response;
  }
}

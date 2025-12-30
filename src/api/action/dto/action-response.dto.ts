import { Action, ChecklistItem } from '@/core/domain/action';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';
import { ChecklistItemResponseDto } from './checklist-item-response.dto';

export class ActionResponseDto {
  @ApiProperty({
    description: 'ID da ação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Título da ação',
    example: 'Implementar módulo de relatórios',
  })
  title!: string;

  @ApiProperty({
    description: 'Descrição detalhada da ação',
    example: 'Criar funcionalidade para geração de relatórios gerenciais',
  })
  description!: string;

  @ApiProperty({
    description: 'Status atual da ação',
    enum: ActionStatus,
    example: ActionStatus.IN_PROGRESS,
  })
  status!: ActionStatus;

  @ApiProperty({
    description: 'Prioridade da ação',
    enum: ActionPriority,
    example: ActionPriority.HIGH,
  })
  priority!: ActionPriority;

  @ApiProperty({
    description: 'Data estimada de início',
    example: '2025-01-01T00:00:00.000Z',
  })
  estimatedStartDate!: Date;

  @ApiProperty({
    description: 'Data estimada de término',
    example: '2025-01-15T00:00:00.000Z',
  })
  estimatedEndDate!: Date;

  @ApiProperty({
    description: 'Data real de início',
    example: '2025-01-02T00:00:00.000Z',
    nullable: true,
  })
  actualStartDate!: Date | null;

  @ApiProperty({
    description: 'Data real de término',
    example: '2025-01-14T00:00:00.000Z',
    nullable: true,
  })
  actualEndDate!: Date | null;

  @ApiProperty({
    description: 'Indica se a ação está atrasada',
    example: false,
  })
  isLate!: boolean;

  @ApiProperty({
    description: 'Indica se a ação está bloqueada',
    example: false,
  })
  isBlocked!: boolean;

  @ApiProperty({
    description: 'Motivo do bloqueio',
    example: 'Aguardando aprovação do orçamento',
    nullable: true,
  })
  blockedReason!: string | null;

  @ApiProperty({
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId!: string;

  @ApiProperty({
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  teamId!: string | null;

  @ApiProperty({
    description: 'ID do criador da ação',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  creatorId!: string;

  @ApiProperty({
    description: 'ID do responsável pela ação',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  responsibleId!: string;

  @ApiProperty({
    description: 'Itens da checklist',
    type: [ChecklistItemResponseDto],
  })
  checklistItems!: ChecklistItemResponseDto[];

  static fromDomain(
    action: Action,
    checklistItems?: ChecklistItem[],
  ): ActionResponseDto {
    const response = new ActionResponseDto();
    response.id = action.id;
    response.title = action.title;
    response.description = action.description;
    response.status = action.status;
    response.priority = action.priority;
    response.estimatedStartDate = action.estimatedStartDate;
    response.estimatedEndDate = action.estimatedEndDate;
    response.actualStartDate = action.actualStartDate;
    response.actualEndDate = action.actualEndDate;
    response.isLate = action.isLate;
    response.isBlocked = action.isBlocked;
    response.blockedReason = action.blockedReason;
    response.companyId = action.companyId;
    response.teamId = action.teamId;
    response.creatorId = action.creatorId;
    response.responsibleId = action.responsibleId;
    response.checklistItems = checklistItems
      ? checklistItems.map((item) => ChecklistItemResponseDto.fromDomain(item))
      : [];
    return response;
  }
}

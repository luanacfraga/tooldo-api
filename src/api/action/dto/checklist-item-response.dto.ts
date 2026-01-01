import { ChecklistItem } from '@/core/domain/action';
import { ApiProperty } from '@nestjs/swagger';

export class ChecklistItemResponseDto {
  @ApiProperty({
    description: 'ID do item da checklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Descrição do item',
    example: 'Revisar código',
  })
  description!: string;

  @ApiProperty({
    description: 'Indica se o item está completo',
    example: false,
  })
  isCompleted!: boolean;

  @ApiProperty({
    description: 'Indica se o item está marcado (mesmo que isCompleted)',
    example: false,
  })
  checked!: boolean;

  @ApiProperty({
    description: 'Data de conclusão do item',
    example: '2025-01-10T14:30:00.000Z',
    nullable: true,
  })
  completedAt!: string | null;

  @ApiProperty({
    description: 'Ordem do item na lista',
    example: 0,
  })
  order!: number;

  static fromDomain(item: ChecklistItem): ChecklistItemResponseDto {
    const response = new ChecklistItemResponseDto();
    response.id = item.id;
    response.description = item.description;
    response.isCompleted = item.isCompleted;
    response.checked = item.isCompleted; // checked é o mesmo que isCompleted
    response.completedAt = item.completedAt
      ? item.completedAt.toISOString()
      : null;
    response.order = item.order;
    return response;
  }
}

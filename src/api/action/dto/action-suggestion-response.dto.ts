import { ActionPriority } from '@/core/domain/shared/enums';
import type { ActionSuggestion } from '@/core/ports/services/ai-service.port';
import { ApiProperty } from '@nestjs/swagger';

export class ActionSuggestionResponseDto {
  @ApiProperty({
    description: 'Título sugerido para a ação',
    example: 'Planejar: Aumentar produtividade da equipe',
  })
  title!: string;

  @ApiProperty({
    description: 'Descrição sugerida para a ação',
    example: 'Fase de planejamento para aumentar produtividade...',
  })
  description!: string;

  @ApiProperty({
    description: 'Prioridade sugerida',
    enum: ActionPriority,
    example: ActionPriority.HIGH,
  })
  priority!: ActionPriority;

  @ApiProperty({
    description: 'Duração estimada em dias',
    example: 5,
  })
  estimatedDurationDays!: number;

  @ApiProperty({
    description: 'Itens sugeridos para checklist',
    example: ['Definir objetivos', 'Mapear recursos', 'Criar cronograma'],
    type: [String],
  })
  checklistItems!: string[];

  static fromDomain(suggestion: ActionSuggestion): ActionSuggestionResponseDto {
    const response = new ActionSuggestionResponseDto();
    response.title = suggestion.title;
    response.description = suggestion.description;
    response.priority = suggestion.priority;
    response.estimatedDurationDays = suggestion.estimatedDurationDays;
    response.checklistItems = suggestion.checklistItems;
    return response;
  }
}

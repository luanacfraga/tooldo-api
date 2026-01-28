import { ApiProperty } from '@nestjs/swagger';
import type { GenerateActionPlanOutput } from '@/application/services/action/generate-action-plan.service';
import { ActionSuggestionResponseDto } from './action-suggestion-response.dto';
import { UsageStatsResponseDto } from './usage-stats-response.dto';

export class GenerateActionPlanResponseDto {
  @ApiProperty({
    description: 'Lista de sugestões de ações geradas pela IA',
    type: [ActionSuggestionResponseDto],
  })
  suggestions!: ActionSuggestionResponseDto[];

  @ApiProperty({
    description: 'Estatísticas de uso de IA',
    type: UsageStatsResponseDto,
  })
  usage!: UsageStatsResponseDto;

  static fromDomain(
    output: GenerateActionPlanOutput,
  ): GenerateActionPlanResponseDto {
    const response = new GenerateActionPlanResponseDto();
    response.suggestions = output.suggestions.map((s) =>
      ActionSuggestionResponseDto.fromDomain(s),
    );
    response.usage = UsageStatsResponseDto.fromDomain(output.usage);
    return response;
  }
}

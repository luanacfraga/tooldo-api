import { ActionPriority } from '@/core/domain/shared/enums';
import type {
  ActionSuggestion,
  AIService,
  GenerateActionPlanInput,
} from '@/core/ports/services/ai-service.port';
import { Injectable } from '@nestjs/common';

/**
 * Stub implementation of AI service for development.
 * Replace with OpenAI implementation when ready.
 */
@Injectable()
export class StubAIService implements AIService {
  async generateActionPlan(
    input: GenerateActionPlanInput,
  ): Promise<ActionSuggestion[]> {
    // TODO: Replace with actual OpenAI implementation
    // For now, return mock suggestions based on the goal

    await Promise.resolve(); // Simulate async operation

    const suggestions: ActionSuggestion[] = [
      {
        rootCause: `Necessidade de ${input.goal}`,
        title: `Planejar: ${input.goal}`,
        description: `Fase de planejamento para ${input.goal}. Definir escopo, objetivos e recursos necessários.`,
        priority: ActionPriority.HIGH,
        estimatedStartDays: 0,
        estimatedDurationDays: 5,
        checklistItems: [
          'Definir objetivos claros',
          'Mapear recursos necessários',
          'Criar cronograma inicial',
          'Identificar riscos potenciais',
        ],
      },
      {
        rootCause: `Necessidade de ${input.goal}`,
        title: `Executar: ${input.goal}`,
        description: `Fase de execução para ${input.goal}. Implementar o planejado e acompanhar progresso.`,
        priority: ActionPriority.MEDIUM,
        estimatedStartDays: 5,
        estimatedDurationDays: 10,
        checklistItems: [
          'Iniciar implementação',
          'Acompanhar progresso diário',
          'Ajustar plano conforme necessário',
          'Documentar decisões importantes',
        ],
      },
      {
        rootCause: `Necessidade de ${input.goal}`,
        title: `Revisar e Otimizar: ${input.goal}`,
        description: `Fase de revisão para ${input.goal}. Avaliar resultados e identificar melhorias.`,
        priority: ActionPriority.LOW,
        estimatedStartDays: 15,
        estimatedDurationDays: 3,
        checklistItems: [
          'Coletar feedback',
          'Analisar métricas de sucesso',
          'Identificar pontos de melhoria',
          'Documentar lições aprendidas',
        ],
      },
    ];

    return suggestions;
  }
}

/**
 * Future OpenAI implementation example:
 *
 * import OpenAI from 'openai';
 *
 * @Injectable()
 * export class OpenAIService implements AIService {
 *   private openai: OpenAI;
 *
 *   constructor(private configService: ConfigService) {
 *     this.openai = new OpenAI({
 *       apiKey: configService.get('OPENAI_API_KEY'),
 *     });
 *   }
 *
 *   async generateActionPlan(input: GenerateActionPlanInput): Promise<ActionSuggestion[]> {
 *     const prompt = this.buildPrompt(input);
 *
 *     const completion = await this.openai.chat.completions.create({
 *       model: "gpt-4",
 *       messages: [
 *         { role: "system", content: "Você é um assistente especializado..." },
 *         { role: "user", content: prompt }
 *       ],
 *       response_format: { type: "json_object" }
 *     });
 *
 *     return JSON.parse(completion.choices[0].message.content);
 *   }
 *
 *   private buildPrompt(input: GenerateActionPlanInput): string {
 *     return `Gere um plano de ação para: ${input.goal}
 *       Empresa: ${input.companyName}
 *       ${input.teamName ? `Equipe: ${input.teamName}` : ''}
 *       ...`;
 *   }
 * }
 */

import type {
  ActionSuggestion,
  AIService,
  GenerateActionPlanInput,
} from '@/core/ports/services/ai-service.port';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  actionPlanResponseFormat,
  type ActionPlanResponse,
} from './action-plan.schema';

/**
 * OpenAI implementation of AI service for action plan generation.
 * Uses GPT-4o-mini with Structured Outputs for reliable JSON responses.
 */
@Injectable()
export class OpenAIService implements AIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured in environment variables',
      );
    }

    this.openai = new OpenAI({
      apiKey,
    });

    this.logger.log('OpenAI service initialized successfully');
  }

  async generateActionPlan(
    input: GenerateActionPlanInput,
  ): Promise<ActionSuggestion[]> {
    try {
      this.logger.log(
        `Generating action plan for company: ${input.companyName}, goal: ${input.goal}`,
      );

      const prompt = this.buildPrompt(input);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: actionPlanResponseFormat,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('OpenAI returned empty response');
      }

      const parsedResponse = JSON.parse(response) as ActionPlanResponse;

      this.logger.log(
        `Successfully generated ${parsedResponse.suggestions.length} action suggestions`,
      );

      return parsedResponse.suggestions;
    } catch (error) {
      this.logger.error('Error generating action plan with OpenAI', error);
      throw new Error(
        `Failed to generate action plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private getSystemPrompt(): string {
    return `Você é um assistente especializado em planejamento estratégico e gestão de ações empresariais.

Sua função é analisar objetivos e contextos de empresas/equipes e gerar planos de ação estruturados, práticos e acionáveis.

Ao gerar sugestões de ações:
- Identifique a causa raiz ou motivação por trás de cada ação
- Crie títulos claros e objetivos que descrevam a ação principal
- Forneça descrições detalhadas explicando o que fazer e por quê
- Atribua prioridades baseadas em impacto e urgência
- Estime datas de início relativas (dias após hoje) considerando dependências
- Estime durações realistas em dias
- Crie checklists detalhadas com 3-8 itens específicos e acionáveis

Sempre gere exatamente 3 sugestões de ações complementares que, juntas, formem um plano coerente para alcançar o objetivo.

Considere o contexto da empresa, equipe e ações recentes para gerar sugestões relevantes e alinhadas com o estilo de trabalho existente.`;
  }

  private buildPrompt(input: GenerateActionPlanInput): string {
    const parts: string[] = [];

    // Company context
    parts.push(`**EMPRESA:**`);
    parts.push(`Nome: ${input.companyName}`);
    if (input.companyDescription) {
      parts.push(`Descrição: ${input.companyDescription}`);
    }

    // Team context
    if (input.teamName) {
      parts.push(`\n**EQUIPE:**`);
      parts.push(`Nome: ${input.teamName}`);
      if (input.teamContext) {
        parts.push(`Contexto: ${input.teamContext}`);
      }
    }

    // Recent actions for context
    if (input.recentActions && input.recentActions.length > 0) {
      parts.push(`\n**AÇÕES RECENTES (para contexto):**`);
      input.recentActions.forEach((action, index) => {
        parts.push(
          `${index + 1}. [${action.status}] ${action.title}: ${action.description}`,
        );
      });
    }

    // Main goal
    parts.push(`\n**OBJETIVO:**`);
    parts.push(input.goal);

    // Instructions
    parts.push(`\n**TAREFA:**`);
    parts.push(
      `Gere um plano de ação com 3 sugestões complementares para alcançar este objetivo, considerando o contexto da empresa e equipe.`,
    );

    return parts.join('\n');
  }
}

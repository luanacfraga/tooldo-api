import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import type {
  ActionSuggestion,
  AIService,
} from '@/core/ports/services/ai-service.port';
import { Inject, Injectable } from '@nestjs/common';
import {
  IAUsageService,
  type UsageStats,
} from '@/application/services/ia-usage/ia-usage.service';

export interface GenerateActionPlanInput {
  companyId: string;
  teamId?: string;
  goal: string;
}

export interface GenerateActionPlanOutput {
  suggestions: ActionSuggestion[];
}

@Injectable()
export class GenerateActionPlanService {
  constructor(
    @Inject('AIService')
    private readonly aiService: AIService,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
  ) {}

  async execute(
    input: GenerateActionPlanInput,
  ): Promise<GenerateActionPlanOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    let teamName: string | undefined;
    let teamContext: string | undefined;

    if (input.teamId) {
      const team = await this.teamRepository.findById(input.teamId);
      if (!team) {
        throw new EntityNotFoundException('Equipe', input.teamId);
      }

      teamName = team.name;
      teamContext = team.iaContext ?? undefined;
    }

    const recentActions = await this.getRecentActions(
      input.companyId,
      input.teamId,
    );

    const suggestions = await this.aiService.generateActionPlan({
      companyName: company.name,
      companyDescription: company.description ?? undefined,
      teamName,
      teamContext,
      goal: input.goal,
      recentActions: recentActions.map((action) => ({
        title: action.title,
        description: action.description,
        status: action.status,
      })),
    });

    return {
      suggestions,
    };
  }

  private async getRecentActions(
    companyId: string,
    teamId?: string,
  ): Promise<Array<{ title: string; description: string; status: string }>> {
    const actions = teamId
      ? await this.actionRepository.findByTeamId(teamId)
      : await this.actionRepository.findByCompanyId(companyId);

    // Return up to 5 most recent actions
    return actions.slice(0, 5).map((action) => ({
      title: action.title,
      description: action.description,
      status: action.status,
    }));
  }
}

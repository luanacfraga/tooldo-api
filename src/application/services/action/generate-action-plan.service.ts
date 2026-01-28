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
  userId: string;
}

export interface GenerateActionPlanOutput {
  suggestions: ActionSuggestion[];
  usage: UsageStats;
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
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly iaUsageService: IAUsageService,
  ) {}

  async execute(
    input: GenerateActionPlanInput,
  ): Promise<GenerateActionPlanOutput> {
    // 1. Buscar empresa
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    // 2. Buscar subscription ativa do admin da empresa
    const subscription = await this.subscriptionRepository.findActiveByAdminId(
      company.adminId,
    );
    if (!subscription) {
      throw new EntityNotFoundException('Assinatura ativa', company.adminId);
    }

    // 3. Validar limite de chamadas de IA
    await this.iaUsageService.validateLimit({
      subscriptionId: subscription.id,
    });

    // 4. Buscar contexto da equipe (se fornecido)
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

    // 5. Buscar ações recentes para contexto
    const recentActions = await this.getRecentActions(
      input.companyId,
      input.teamId,
    );

    // 6. Gerar plano de ação com IA
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

    // 7. Registrar uso de IA
    await this.iaUsageService.registerUsage({
      subscriptionId: subscription.id,
      userId: input.userId,
      companyId: input.companyId,
      callsUsed: 1,
    });

    // 8. Buscar estatísticas de uso atualizadas
    const usage = await this.iaUsageService.getUsageStats(subscription.id);

    return {
      suggestions,
      usage,
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

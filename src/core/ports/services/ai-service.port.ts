import { ActionPriority } from '@/core/domain/shared/enums';

export interface ActionSuggestion {
  title: string;
  description: string;
  priority: ActionPriority;
  estimatedDurationDays: number;
  checklistItems: string[];
}

export interface GenerateActionPlanInput {
  companyName: string;
  companyDescription?: string;
  teamName?: string;
  teamContext?: string;
  goal: string;
  recentActions?: Array<{
    title: string;
    description: string;
    status: string;
  }>;
}

export interface AIService {
  generateActionPlan(
    input: GenerateActionPlanInput,
  ): Promise<ActionSuggestion[]>;
}

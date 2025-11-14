import { Plan } from '@/core/domain/plan/plan.entity';

export interface PlanRepository {
  create(plan: Plan): Promise<Plan>;
  findByName(name: string): Promise<Plan | null>;
}

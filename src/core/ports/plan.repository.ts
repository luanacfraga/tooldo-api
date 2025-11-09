import { Plan } from '@/core/domain/plan.entity';

export interface PlanRepository {
  create(data: Omit<Plan, 'id'>): Promise<Plan>;
}

import { Plan } from '@/core/domain/plan.entity';
import { PlanRepository } from '@/core/ports/repositories/plan.repository';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const PLAN_REPOSITORY = 'PlanRepository';

@Injectable()
export class CreatePlanService {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(input: Omit<Plan, 'id'>): Promise<Plan> {
    const plan = new Plan(
      randomUUID(),
      input.name,
      input.maxCompanies,
      input.maxManagers,
      input.maxExecutors,
      input.maxConsultants,
      input.iaCallsLimit,
    );
    return this.planRepository.create(plan);
  }
}

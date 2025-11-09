import { Plan } from '@/core/domain/plan.entity';
import type { PlanRepository } from '@/core/ports/plan.repository';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CreatePlanService {
  constructor(private readonly planRepository: PlanRepository) {}

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

import { Plan } from '@/core/domain/plan/plan.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdatePlanInput {
  id: string;
  name: string;
  maxCompanies: number;
  maxManagers: number;
  maxExecutors: number;
  maxConsultants: number;
  iaCallsLimit: number;
}

@Injectable()
export class UpdatePlanService {
  constructor(
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(input: UpdatePlanInput): Promise<Plan> {
    const existingPlan = await this.planRepository.findById(input.id);
    if (!existingPlan) {
      throw new EntityNotFoundException('Plano', input.id);
    }

    const updatedPlan = new Plan(
      input.id,
      input.name,
      input.maxCompanies,
      input.maxManagers,
      input.maxExecutors,
      input.maxConsultants,
      input.iaCallsLimit,
    );

    return this.planRepository.update(updatedPlan);
  }
}

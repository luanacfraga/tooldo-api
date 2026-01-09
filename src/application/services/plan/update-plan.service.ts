import { Plan } from '@/core/domain/plan/plan.entity';
import {
  EntityNotFoundException,
  UniqueConstraintException,
} from '@/core/domain/shared/exceptions/domain.exception';
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

    const planWithSameName = await this.planRepository.findByName(input.name);
    if (planWithSameName && planWithSameName.id !== input.id) {
      throw new UniqueConstraintException('Plano', input.name);
    }

    const updatedPlan = Plan.create({
      id: input.id,
      name: input.name,
      maxCompanies: input.maxCompanies,
      maxManagers: input.maxManagers,
      maxExecutors: input.maxExecutors,
      maxConsultants: input.maxConsultants,
      iaCallsLimit: input.iaCallsLimit,
    });

    return this.planRepository.update(updatedPlan);
  }
}

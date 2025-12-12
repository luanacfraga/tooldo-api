import { Plan } from '@/core/domain/plan/plan.entity';
import { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import { Inject, Injectable } from '@nestjs/common';

export interface CreatePlanInput {
  name: string;
  maxCompanies: number;
  maxManagers: number;
  maxExecutors: number;
  maxConsultants: number;
  iaCallsLimit: number;
}

export interface CreatePlanOutput {
  plan: Plan;
}

@Injectable()
export class CreatePlanService {
  constructor(
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreatePlanInput): Promise<CreatePlanOutput> {
    const plan = Plan.create({
      id: this.idGenerator.generate(),
      name: input.name,
      maxCompanies: input.maxCompanies,
      maxManagers: input.maxManagers,
      maxExecutors: input.maxExecutors,
      maxConsultants: input.maxConsultants,
      iaCallsLimit: input.iaCallsLimit,
    });
    const created = await this.planRepository.create(plan);
    return { plan: created };
  }
}

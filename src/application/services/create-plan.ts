import { Plan } from '@/core/domain/plan.entity';
import { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreatePlanService {
  constructor(
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: Omit<Plan, 'id'>): Promise<Plan> {
    const plan = new Plan(
      this.idGenerator.generate(),
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

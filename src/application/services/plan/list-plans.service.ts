import { Plan } from '@/core/domain/plan/plan.entity';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListPlansService {
  constructor(
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(): Promise<Plan[]> {
    return this.planRepository.findAll();
  }
}

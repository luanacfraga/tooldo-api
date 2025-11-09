import { Plan } from '@/core/domain/plan.entity';
import type { PlanRepository } from '@/core/ports/plan.repository';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanPrismaRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Plan, 'id'>): Promise<Plan> {
    const created = await this.prisma.plan.create({
      data: {
        name: data.name,
        maxCompanies: data.maxCompanies,
        maxManagers: data.maxManagers,
        maxExecutors: data.maxExecutors,
        maxConsultants: data.maxConsultants,
        iaCallsLimit: data.iaCallsLimit,
      },
    });
    return new Plan(
      created.id,
      created.name,
      created.maxCompanies,
      created.maxManagers,
      created.maxExecutors,
      created.maxConsultants,
      created.iaCallsLimit,
    );
  }
}

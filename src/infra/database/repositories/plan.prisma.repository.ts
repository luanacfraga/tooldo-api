import { Plan } from '@/core/domain/plan/plan.entity';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Plan as PrismaPlan } from '@prisma/client';

@Injectable()
export class PlanPrismaRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(plan: Plan): Promise<Plan> {
    const created = await this.prisma.plan.create({
      data: {
        id: plan.id,
        name: plan.name,
        maxCompanies: plan.maxCompanies,
        maxManagers: plan.maxManagers,
        maxExecutors: plan.maxExecutors,
        maxConsultants: plan.maxConsultants,
        iaCallsLimit: plan.iaCallsLimit,
      },
    });

    return this.mapToDomain(created);
  }

  async findByName(name: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findFirst({
      where: { name },
    });

    return plan ? this.mapToDomain(plan) : null;
  }

  async findById(id: string): Promise<Plan | null> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    return plan ? this.mapToDomain(plan) : null;
  }

  async findAll(): Promise<Plan[]> {
    const plans = await this.prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return plans.map((plan) => this.mapToDomain(plan));
  }

  async update(plan: Plan): Promise<Plan> {
    const updated = await this.prisma.plan.update({
      where: { id: plan.id },
      data: {
        name: plan.name,
        maxCompanies: plan.maxCompanies,
        maxManagers: plan.maxManagers,
        maxExecutors: plan.maxExecutors,
        maxConsultants: plan.maxConsultants,
        iaCallsLimit: plan.iaCallsLimit,
      },
    });

    return this.mapToDomain(updated);
  }

  private mapToDomain(prismaPlan: PrismaPlan): Plan {
    return new Plan(
      prismaPlan.id,
      prismaPlan.name,
      prismaPlan.maxCompanies,
      prismaPlan.maxManagers,
      prismaPlan.maxExecutors,
      prismaPlan.maxConsultants,
      prismaPlan.iaCallsLimit,
    );
  }
}

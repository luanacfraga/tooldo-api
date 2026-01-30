import { Company } from '@/core/domain/company/company.entity';
import { Plan } from '@/core/domain/plan/plan.entity';
import { Subscription } from '@/core/domain/subscription/subscription.entity';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListActiveCompaniesWithPlansOutput {
  items: Array<{
    company: Company;
    subscription: Subscription;
    plan: Plan;
    adminName: string;
  }>;
}

@Injectable()
export class ListActiveCompaniesWithPlansService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<ListActiveCompaniesWithPlansOutput> {
    const companies = await this.companyRepository.findAll();
    const items: ListActiveCompaniesWithPlansOutput['items'] = [];

    for (const company of companies) {
      const subscription =
        await this.subscriptionRepository.findActiveByAdminId(company.adminId);
      if (!subscription) {
        continue;
      }

      const plan = await this.planRepository.findById(subscription.planId);
      if (!plan) {
        continue;
      }

      const admin = await this.userRepository.findById(company.adminId);
      const adminName = admin
        ? `${admin.firstName} ${admin.lastName}`.trim() || admin.email
        : company.adminId;

      items.push({
        company,
        subscription,
        plan,
        adminName,
      });
    }

    return { items };
  }
}

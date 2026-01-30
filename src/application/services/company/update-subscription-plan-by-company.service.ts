import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdateSubscriptionPlanByCompanyInput {
  companyId: string;
  planId: string;
}

export interface UpdateSubscriptionPlanByCompanyOutput {
  subscriptionId: string;
  planId: string;
}

@Injectable()
export class UpdateSubscriptionPlanByCompanyService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(
    input: UpdateSubscriptionPlanByCompanyInput,
  ): Promise<UpdateSubscriptionPlanByCompanyOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    const plan = await this.planRepository.findById(input.planId);
    if (!plan) {
      throw new EntityNotFoundException('Plano', input.planId);
    }

    const subscription = await this.subscriptionRepository.findActiveByAdminId(
      company.adminId,
    );
    if (!subscription) {
      throw new EntityNotFoundException('Assinatura ativa', company.adminId);
    }

    const updated = await this.subscriptionRepository.updatePlanId(
      subscription.id,
      input.planId,
    );

    return {
      subscriptionId: updated.id,
      planId: updated.planId,
    };
  }
}

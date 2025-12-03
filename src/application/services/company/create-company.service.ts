import { Company } from '@/core/domain/company/company.entity';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface CreateCompanyInput {
  adminId: string;
  name: string;
  description?: string;
}

export interface CreateCompanyOutput {
  company: Company;
}

@Injectable()
export class CreateCompanyService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreateCompanyInput): Promise<CreateCompanyOutput> {
    await this.validateAdmin(input.adminId);
    const subscription = await this.validateSubscription(input.adminId);
    const plan = await this.validatePlan(subscription.planId);
    await this.validateCompanyLimit(input.adminId, plan.maxCompanies);

    const companyId = this.idGenerator.generate();

    const company = Company.create({
      id: companyId,
      name: input.name,
      description: input.description,
      adminId: input.adminId,
    });

    const createdCompany = await this.companyRepository.create(company);

    return {
      company: createdCompany,
    };
  }

  private async validateAdmin(adminId: string): Promise<void> {
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new EntityNotFoundException('Administrador', adminId);
    }
  }

  private async validateSubscription(adminId: string) {
    const subscription =
      await this.subscriptionRepository.findActiveByAdminId(adminId);
    if (!subscription) {
      throw new EntityNotFoundException('Assinatura ativa', adminId);
    }
    return subscription;
  }

  private async validatePlan(planId: string) {
    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw new EntityNotFoundException('Plano', planId);
    }
    return plan;
  }

  private async validateCompanyLimit(
    adminId: string,
    maxCompanies: number,
  ): Promise<void> {
    const currentCompanyCount =
      await this.companyRepository.countByAdminId(adminId);

    if (currentCompanyCount >= maxCompanies) {
      throw new DomainValidationException(
        ErrorMessages.COMPANY.MAX_COMPANIES_EXCEEDED,
      );
    }
  }
}

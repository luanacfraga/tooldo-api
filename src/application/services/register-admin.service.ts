import { Company } from '@/core/domain/company.entity';
import { DocumentType } from '@/core/domain/enums';
import {
  EntityNotFoundException,
  UniqueConstraintException,
} from '@/core/domain/exceptions/domain.exception';
import { Subscription } from '@/core/domain/subscription.entity';
import { User } from '@/core/domain/user.entity';
import type { CompanyRepository } from '@/core/ports/company.repository';
import type { PlanRepository } from '@/core/ports/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/subscription.repository';
import type { UserRepository } from '@/core/ports/user.repository';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export const USER_REPOSITORY = 'UserRepository';
export const COMPANY_REPOSITORY = 'CompanyRepository';
export const SUBSCRIPTION_REPOSITORY = 'SubscriptionRepository';
export const PLAN_REPOSITORY = 'PlanRepository';

export interface RegisterAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  document: string;
  documentType: DocumentType;
  company: {
    name: string;
    description?: string;
  };
}

export interface RegisterAdminOutput {
  user: User;
  company: Company;
  subscription: Subscription;
}

@Injectable()
export class RegisterAdminService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(input: RegisterAdminInput): Promise<RegisterAdminOutput> {
    await this.validateUniqueConstraints(input);

    const defaultPlan = await this.findDefaultPlan();

    const userId = randomUUID();

    const user = User.createAdmin(
      userId,
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.document,
      input.documentType,
      input.password,
      null,
    );

    const createdUser = await this.userRepository.create(user);

    const company = new Company(
      randomUUID(),
      input.company.name,
      input.company.description ?? null,
      userId,
    );

    const createdCompany = await this.companyRepository.create(company);

    const subscription = Subscription.create(
      randomUUID(),
      userId,
      defaultPlan.id,
    );

    const createdSubscription =
      await this.subscriptionRepository.create(subscription);

    return {
      user: createdUser,
      company: createdCompany,
      subscription: createdSubscription,
    };
  }

  private async validateUniqueConstraints(
    input: RegisterAdminInput,
  ): Promise<void> {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new UniqueConstraintException('Email', input.email);
    }

    const existingPhone = await this.userRepository.findByPhone(input.phone);
    if (existingPhone) {
      throw new UniqueConstraintException('Telefone', input.phone);
    }

    const existingDocument = await this.userRepository.findByDocument(
      input.document,
    );
    if (existingDocument) {
      throw new UniqueConstraintException('Documento', input.document);
    }
  }

  private async findDefaultPlan() {
    const defaultPlan = await this.planRepository.findByName('default');
    if (!defaultPlan) {
      throw new EntityNotFoundException(ErrorMessages.PLAN.DEFAULT_NOT_FOUND);
    }
    return defaultPlan;
  }
}

import {
  COMPANY_REPOSITORY,
  PLAN_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
  USER_REPOSITORY,
} from '@/core/di/tokens';
import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { SubscriptionPrismaRepository } from '@/infra/database/repositories/subscription.prisma.repository';
import { UserPrismaRepository } from '@/infra/database/repositories/user.prisma.repository';
import { PrismaService } from '@/infra/prisma/prisma.service';
import { ClassProvider, Module } from '@nestjs/common';

const userRepositoryProvider: ClassProvider = {
  provide: USER_REPOSITORY,
  useClass: UserPrismaRepository,
};

const companyRepositoryProvider: ClassProvider = {
  provide: COMPANY_REPOSITORY,
  useClass: CompanyPrismaRepository,
};

const subscriptionRepositoryProvider: ClassProvider = {
  provide: SUBSCRIPTION_REPOSITORY,
  useClass: SubscriptionPrismaRepository,
};

const planRepositoryProvider: ClassProvider = {
  provide: PLAN_REPOSITORY,
  useClass: PlanPrismaRepository,
};

@Module({
  providers: [
    PrismaService,
    userRepositoryProvider,
    companyRepositoryProvider,
    subscriptionRepositoryProvider,
    planRepositoryProvider,
  ],
  exports: [
    PrismaService,
    USER_REPOSITORY,
    COMPANY_REPOSITORY,
    SUBSCRIPTION_REPOSITORY,
    PLAN_REPOSITORY,
  ],
})
export class DatabaseModule {}

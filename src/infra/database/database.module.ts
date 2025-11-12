import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { SubscriptionPrismaRepository } from '@/infra/database/repositories/subscription.prisma.repository';
import { UserPrismaRepository } from '@/infra/database/repositories/user.prisma.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { ClassProvider, Module } from '@nestjs/common';

const userRepositoryProvider: ClassProvider = {
  provide: 'UserRepository',
  useClass: UserPrismaRepository,
};

const companyRepositoryProvider: ClassProvider = {
  provide: 'CompanyRepository',
  useClass: CompanyPrismaRepository,
};

const subscriptionRepositoryProvider: ClassProvider = {
  provide: 'SubscriptionRepository',
  useClass: SubscriptionPrismaRepository,
};

const planRepositoryProvider: ClassProvider = {
  provide: 'PlanRepository',
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
    'UserRepository',
    'CompanyRepository',
    'SubscriptionRepository',
    'PlanRepository',
  ],
})
export class DatabaseModule {}

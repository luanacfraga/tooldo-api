import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository';
import { CompanyUserPrismaRepository } from '@/infra/database/repositories/company-user.prisma.repository';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { SubscriptionPrismaRepository } from '@/infra/database/repositories/subscription.prisma.repository';
import { UserPrismaRepository } from '@/infra/database/repositories/user.prisma.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaTransactionManager } from '@/infra/database/prisma/transaction-manager.service';
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

const companyUserRepositoryProvider: ClassProvider = {
  provide: 'CompanyUserRepository',
  useClass: CompanyUserPrismaRepository,
};

const transactionManagerProvider: ClassProvider = {
  provide: 'TransactionManager',
  useClass: PrismaTransactionManager,
};

@Module({
  providers: [
    PrismaService,
    userRepositoryProvider,
    companyRepositoryProvider,
    companyUserRepositoryProvider,
    subscriptionRepositoryProvider,
    planRepositoryProvider,
    transactionManagerProvider,
  ],
  exports: [
    PrismaService,
    'UserRepository',
    'CompanyRepository',
    'CompanyUserRepository',
    'SubscriptionRepository',
    'PlanRepository',
    'TransactionManager',
  ],
})
export class DatabaseModule {}

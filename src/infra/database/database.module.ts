import { ActionMovementPrismaRepository } from '@/infra/database/repositories/action-movement.prisma.repository';
import { ActionPrismaRepository } from '@/infra/database/repositories/action.prisma.repository';
import { ChecklistItemPrismaRepository } from '@/infra/database/repositories/checklist-item.prisma.repository';
import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository';
import { CompanyUserPrismaRepository } from '@/infra/database/repositories/company-user.prisma.repository';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { SubscriptionPrismaRepository } from '@/infra/database/repositories/subscription.prisma.repository';
import { TeamPrismaRepository } from '@/infra/database/repositories/team.prisma.repository';
import { TeamUserPrismaRepository } from '@/infra/database/repositories/team-user.prisma.repository';
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

const teamRepositoryProvider: ClassProvider = {
  provide: 'TeamRepository',
  useClass: TeamPrismaRepository,
};

const teamUserRepositoryProvider: ClassProvider = {
  provide: 'TeamUserRepository',
  useClass: TeamUserPrismaRepository,
};

const transactionManagerProvider: ClassProvider = {
  provide: 'TransactionManager',
  useClass: PrismaTransactionManager,
};

const actionRepositoryProvider: ClassProvider = {
  provide: 'ActionRepository',
  useClass: ActionPrismaRepository,
};

const checklistItemRepositoryProvider: ClassProvider = {
  provide: 'ChecklistItemRepository',
  useClass: ChecklistItemPrismaRepository,
};

const actionMovementRepositoryProvider: ClassProvider = {
  provide: 'ActionMovementRepository',
  useClass: ActionMovementPrismaRepository,
};

@Module({
  providers: [
    PrismaService,
    userRepositoryProvider,
    companyRepositoryProvider,
    companyUserRepositoryProvider,
    teamRepositoryProvider,
    teamUserRepositoryProvider,
    subscriptionRepositoryProvider,
    planRepositoryProvider,
    transactionManagerProvider,
    actionRepositoryProvider,
    checklistItemRepositoryProvider,
    actionMovementRepositoryProvider,
  ],
  exports: [
    PrismaService,
    'UserRepository',
    'CompanyRepository',
    'CompanyUserRepository',
    'TeamRepository',
    'TeamUserRepository',
    'SubscriptionRepository',
    'PlanRepository',
    'TransactionManager',
    'ActionRepository',
    'ChecklistItemRepository',
    'ActionMovementRepository',
  ],
})
export class DatabaseModule {}

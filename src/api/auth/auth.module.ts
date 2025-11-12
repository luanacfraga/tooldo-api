import { AppModule } from '@/app.module';
import {
  COMPANY_REPOSITORY,
  PLAN_REPOSITORY,
  RegisterAdminService,
  SUBSCRIPTION_REPOSITORY,
  USER_REPOSITORY,
} from '@/application/services/register-admin.service';
import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { SubscriptionPrismaRepository } from '@/infra/database/repositories/subscription.prisma.repository';
import { UserPrismaRepository } from '@/infra/database/repositories/user.prisma.repository';
import { PasswordHashService } from '@/shared/services/password-hash.service';
import { ClassProvider, Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';

const userRepositoryProvider: ClassProvider = {
  provide: USER_REPOSITORY as string,
  useClass: UserPrismaRepository,
};

const companyRepositoryProvider: ClassProvider = {
  provide: COMPANY_REPOSITORY as string,
  useClass: CompanyPrismaRepository,
};

const subscriptionRepositoryProvider: ClassProvider = {
  provide: SUBSCRIPTION_REPOSITORY as string,
  useClass: SubscriptionPrismaRepository,
};

const planRepositoryProvider: ClassProvider = {
  provide: PLAN_REPOSITORY as string,
  useClass: PlanPrismaRepository,
};

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [AuthController],
  providers: [
    RegisterAdminService,
    PasswordHashService,
    UserPrismaRepository,
    CompanyPrismaRepository,
    SubscriptionPrismaRepository,
    PlanPrismaRepository,
    userRepositoryProvider,
    companyRepositoryProvider,
    subscriptionRepositoryProvider,
    planRepositoryProvider,
  ],
})
export class AuthModule {}

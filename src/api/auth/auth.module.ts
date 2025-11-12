import { AppModule } from '@/app.module';
import {
  COMPANY_REPOSITORY,
  ID_GENERATOR,
  PLAN_REPOSITORY,
  PASSWORD_HASHER,
  RegisterAdminService,
  SUBSCRIPTION_REPOSITORY,
  USER_REPOSITORY,
} from '@/application/services/register-admin.service';
import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { SubscriptionPrismaRepository } from '@/infra/database/repositories/subscription.prisma.repository';
import { UserPrismaRepository } from '@/infra/database/repositories/user.prisma.repository';
import { CryptoIdGenerator } from '@/infra/services/id-generator.service';
import { BcryptPasswordHasher } from '@/infra/services/password-hasher.service';
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

const passwordHasherProvider: ClassProvider = {
  provide: PASSWORD_HASHER as string,
  useClass: BcryptPasswordHasher,
};

const idGeneratorProvider: ClassProvider = {
  provide: ID_GENERATOR as string,
  useClass: CryptoIdGenerator,
};

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [AuthController],
  providers: [
    RegisterAdminService,
    UserPrismaRepository,
    CompanyPrismaRepository,
    SubscriptionPrismaRepository,
    PlanPrismaRepository,
    BcryptPasswordHasher,
    CryptoIdGenerator,
    userRepositoryProvider,
    companyRepositoryProvider,
    subscriptionRepositoryProvider,
    planRepositoryProvider,
    passwordHasherProvider,
    idGeneratorProvider,
  ],
})
export class AuthModule {}

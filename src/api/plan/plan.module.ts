import { AppModule } from '@/app.module';
import {
  CreatePlanService,
  PLAN_REPOSITORY,
} from '@/application/services/create-plan';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { ClassProvider, Module, forwardRef } from '@nestjs/common';
import { PlanController } from './plan.controller';

const planRepositoryProvider: ClassProvider = {
  provide: PLAN_REPOSITORY as string,
  useClass: PlanPrismaRepository,
};

@Module({
  imports: [forwardRef(() => AppModule)],
  controllers: [PlanController],
  providers: [CreatePlanService, PlanPrismaRepository, planRepositoryProvider],
})
export class PlanModule {}

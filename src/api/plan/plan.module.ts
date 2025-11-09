import { CreatePlanService } from '@/application/services/create-plan';
import { PlanPrismaRepository } from '@/infra/database/repositories/plan.prisma.repository';
import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';

@Module({
  controllers: [PlanController],
  providers: [CreatePlanService, PlanPrismaRepository],
})
export class PlanModule {}

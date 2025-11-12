import { CreatePlanService } from '@/application/services/create-plan';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanController],
  providers: [CreatePlanService],
})
export class PlanModule {}

import { CreatePlanService } from '@/application/services/create-plan';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  controllers: [PlanController],
  providers: [CreatePlanService],
})
export class PlanModule {}

import { CreatePlanService } from '@/application/services/plan/create-plan.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  providers: [CreatePlanService],
  exports: [CreatePlanService],
})
export class PlanApplicationModule {}

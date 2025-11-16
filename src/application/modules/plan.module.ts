import { CreatePlanService } from '@/application/services/plan/create-plan.service';
import { ListPlansService } from '@/application/services/plan/list-plans.service';
import { UpdatePlanService } from '@/application/services/plan/update-plan.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  providers: [CreatePlanService, ListPlansService, UpdatePlanService],
  exports: [CreatePlanService, ListPlansService, UpdatePlanService],
})
export class PlanApplicationModule {}

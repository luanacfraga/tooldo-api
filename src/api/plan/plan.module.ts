import { PlanApplicationModule } from '@/application/modules/plan.module';
import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';

@Module({
  imports: [PlanApplicationModule],
  controllers: [PlanController],
})
export class PlanModule {}

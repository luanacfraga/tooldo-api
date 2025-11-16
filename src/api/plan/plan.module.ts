import { PlanApplicationModule } from '@/application/modules';
import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';

@Module({
  imports: [PlanApplicationModule],
  controllers: [PlanController],
})
export class PlanModule {}

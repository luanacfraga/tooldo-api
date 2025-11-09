import { Module } from '@nestjs/common';
import { PlanModule } from './api/plan/plan.module';
import { PrismaService } from './infra/prisma/prisma.service';

@Module({
  imports: [PlanModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

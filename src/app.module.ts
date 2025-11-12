import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { PlanModule } from './api/plan/plan.module';
import { PrismaService } from './infra/prisma/prisma.service';

@Module({
  imports: [PlanModule, AuthModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

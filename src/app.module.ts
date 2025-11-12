import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './api/auth/auth.module';
import { DomainExceptionFilter } from './api/filters/domain-exception.filter';
import { PlanModule } from './api/plan/plan.module';

@Module({
  imports: [PlanModule, AuthModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class AppModule {}

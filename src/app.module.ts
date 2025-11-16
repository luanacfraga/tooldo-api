import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './api/auth/auth.module';
import { JwtAuthGuard } from './api/auth/guards/jwt-auth.guard';
import { RolesGuard } from './api/auth/guards/roles.guard';
import { CompanyModule } from './api/company/company.module';
import { EmployeeModule } from './api/employee/employee.module';
import { PlanModule } from './api/plan/plan.module';
import { DomainExceptionFilter } from './api/shared/filters/domain-exception.filter';
import { ConfigModule } from './infra/config/config.module';

@Module({
  imports: [
    ConfigModule,
    PlanModule,
    AuthModule,
    CompanyModule,
    EmployeeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

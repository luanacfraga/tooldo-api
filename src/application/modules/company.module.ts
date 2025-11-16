import { CreateCompanyService } from '@/application/services/company/create-company.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  providers: [CreateCompanyService],
  exports: [CreateCompanyService],
})
export class CompanyApplicationModule {}

import { CreateCompanyService } from '@/application/services/company/create-company.service';
import { DeleteCompanyService } from '@/application/services/company/delete-company.service';
import { GetCompanyDashboardSummaryService } from '@/application/services/company/get-company-dashboard-summary.service';
import { GetExecutorDashboardService } from '@/application/services/company/get-executor-dashboard.service';
import { ListCompaniesService } from '@/application/services/company/list-companies.service';
import { UpdateCompanyService } from '@/application/services/company/update-company.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  providers: [
    CreateCompanyService,
    ListCompaniesService,
    UpdateCompanyService,
    DeleteCompanyService,
    GetCompanyDashboardSummaryService,
    GetExecutorDashboardService,
  ],
  exports: [
    CreateCompanyService,
    ListCompaniesService,
    UpdateCompanyService,
    DeleteCompanyService,
    GetCompanyDashboardSummaryService,
    GetExecutorDashboardService,
  ],
})
export class CompanyApplicationModule {}

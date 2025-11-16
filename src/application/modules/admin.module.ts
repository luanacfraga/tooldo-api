import { RegisterAdminService } from '@/application/services/admin/register-admin.service';
import { RegisterMasterService } from '@/application/services/admin/register-master.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';
import { FactoriesModule } from './factories.module';

@Module({
  imports: [DatabaseModule, SharedServicesModule, FactoriesModule],
  providers: [RegisterAdminService, RegisterMasterService],
  exports: [RegisterAdminService, RegisterMasterService],
})
export class AdminApplicationModule {}

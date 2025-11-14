import { RegisterAdminService } from '@/application/services/admin/register-admin.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';
import { FactoriesModule } from './factories.module';

@Module({
  imports: [DatabaseModule, SharedServicesModule, FactoriesModule],
  providers: [RegisterAdminService],
  exports: [RegisterAdminService],
})
export class AdminApplicationModule {}

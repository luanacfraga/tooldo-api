import { RegisterAdminService } from '@/application/services/register-admin.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  controllers: [AuthController],
  providers: [RegisterAdminService],
})
export class AuthModule {}

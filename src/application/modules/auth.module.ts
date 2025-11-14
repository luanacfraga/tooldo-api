import { AuthService } from '@/application/services/auth/auth.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthApplicationModule {}

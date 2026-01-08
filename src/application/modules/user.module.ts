import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
import { UpdateUserAvatarColorService } from '@/application/services/user/update-user-avatar-color.service';

@Module({
  imports: [DatabaseModule],
  providers: [UpdateUserAvatarColorService],
  exports: [UpdateUserAvatarColorService],
})
export class UserApplicationModule {}

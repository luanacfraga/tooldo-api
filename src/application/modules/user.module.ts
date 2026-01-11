import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
import { UpdateUserAvatarColorService } from '@/application/services/user/update-user-avatar-color.service';
import { ListUsersService } from '@/application/services/user/list-users.service';

@Module({
  imports: [DatabaseModule],
  providers: [UpdateUserAvatarColorService, ListUsersService],
  exports: [UpdateUserAvatarColorService, ListUsersService],
})
export class UserApplicationModule {}

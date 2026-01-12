import { ListUsersService } from '@/application/services/user/list-users.service';
import { UpdateUserAvatarColorService } from '@/application/services/user/update-user-avatar-color.service';
import { UpdateUserProfileService } from '@/application/services/user/update-user-profile.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule],
  providers: [
    UpdateUserAvatarColorService,
    ListUsersService,
    UpdateUserProfileService,
  ],
  exports: [
    UpdateUserAvatarColorService,
    ListUsersService,
    UpdateUserProfileService,
  ],
})
export class UserApplicationModule {}

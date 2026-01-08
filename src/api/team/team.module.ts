import { TeamApplicationModule } from '@/application/modules/team.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';

@Module({
  imports: [TeamApplicationModule, DatabaseModule],
  controllers: [TeamController],
})
export class TeamModule {}

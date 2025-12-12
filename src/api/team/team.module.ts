import { TeamApplicationModule } from '@/application/modules/team.module';
import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';

@Module({
  imports: [TeamApplicationModule],
  controllers: [TeamController],
})
export class TeamModule {}

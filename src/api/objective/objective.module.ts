import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { ObjectiveController } from './objective.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ObjectiveController],
})
export class ObjectiveModule {}

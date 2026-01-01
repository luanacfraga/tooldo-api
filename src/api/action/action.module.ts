import { ActionApplicationModule } from '@/application/modules/action.module';
import { Module } from '@nestjs/common';
import { ActionController } from './action.controller';

@Module({
  imports: [ActionApplicationModule],
  controllers: [ActionController],
})
export class ActionModule {}

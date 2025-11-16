import { SubscriptionFactory } from '@/application/factories/subscription.factory';
import { UserFactory } from '@/application/factories/user.factory';
import { Module } from '@nestjs/common';

@Module({
  providers: [UserFactory, SubscriptionFactory],
  exports: [UserFactory, SubscriptionFactory],
})
export class FactoriesModule {}

import { Subscription } from '@/core/domain/subscription.entity';

export interface SubscriptionRepository {
  create(subscription: Subscription): Promise<Subscription>;
}


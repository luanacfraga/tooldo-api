import { Subscription } from '@/core/domain/subscription.entity';

export interface SubscriptionRepository {
  create(subscription: Subscription, tx?: unknown): Promise<Subscription>;
}

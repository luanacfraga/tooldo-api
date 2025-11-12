import { Subscription } from '@/core/domain/subscription.entity';

export interface SubscriptionRepository {
  create(subscription: Omit<Subscription, 'id'>): Promise<Subscription>;
}

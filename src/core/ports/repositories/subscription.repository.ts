import { Subscription } from '@/core/domain/subscription/subscription.entity';

export interface SubscriptionRepository {
  create(subscription: Subscription, tx?: unknown): Promise<Subscription>;
  findActiveByAdminId(adminId: string): Promise<Subscription | null>;
}

import { Subscription } from '@/core/domain/subscription/subscription.entity';

export interface SubscriptionRepository {
  create(subscription: Subscription, tx?: unknown): Promise<Subscription>;
  findById(id: string): Promise<Subscription | null>;
  findActiveByAdminId(adminId: string): Promise<Subscription | null>;
  updatePlanId(id: string, planId: string): Promise<Subscription>;
}

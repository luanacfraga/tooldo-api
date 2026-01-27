import { IAUsage } from '@/core/domain/ia-usage/ia-usage.entity';

export interface IAUsageRepository {
  create(iaUsage: IAUsage, tx?: unknown): Promise<IAUsage>;
  countBySubscriptionId(subscriptionId: string): Promise<number>;
}

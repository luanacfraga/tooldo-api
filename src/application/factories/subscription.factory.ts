import { Subscription } from '@/core/domain/subscription/subscription.entity';
import { Injectable } from '@nestjs/common';

export interface CreateSubscriptionInput {
  id: string;
  adminId: string;
  planId: string;
  startedAt?: Date;
}

@Injectable()
export class SubscriptionFactory {
  create(input: CreateSubscriptionInput): Subscription {
    return new Subscription(
      input.id,
      input.adminId,
      input.planId,
      input.startedAt ?? new Date(),
      true,
    );
  }
}

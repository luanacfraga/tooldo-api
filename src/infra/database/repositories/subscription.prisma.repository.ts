import { Subscription } from '@/core/domain/subscription.entity';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Subscription as PrismaSubscription } from '@prisma/client';

@Injectable()
export class SubscriptionPrismaRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(subscription: Subscription): Promise<Subscription> {
    const created = await this.prisma.subscription.create({
      data: {
        id: subscription.id,
        adminId: subscription.adminId,
        planId: subscription.planId,
        startedAt: subscription.startedAt,
        isActive: subscription.isActive,
      },
    });

    return this.mapToDomain(created);
  }

  private mapToDomain(prismaSubscription: PrismaSubscription): Subscription {
    return new Subscription(
      prismaSubscription.id,
      prismaSubscription.adminId,
      prismaSubscription.planId,
      prismaSubscription.startedAt,
      prismaSubscription.isActive,
    );
  }
}

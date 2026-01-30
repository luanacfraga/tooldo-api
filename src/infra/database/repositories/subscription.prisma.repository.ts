import { Subscription } from '@/core/domain/subscription/subscription.entity';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Subscription as PrismaSubscription } from '@prisma/client';

@Injectable()
export class SubscriptionPrismaRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    subscription: Subscription,
    tx?: unknown,
  ): Promise<Subscription> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.subscription.create({
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

  async findById(id: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        id,
      },
    });

    return subscription ? this.mapToDomain(subscription) : null;
  }

  async findActiveByAdminId(adminId: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        adminId,
        isActive: true,
      },
    });

    return subscription ? this.mapToDomain(subscription) : null;
  }

  async updatePlanId(id: string, planId: string): Promise<Subscription> {
    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { planId },
    });
    return this.mapToDomain(updated);
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

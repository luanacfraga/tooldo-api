import { IAUsage } from '@/core/domain/ia-usage/ia-usage.entity';
import { IALimitExceededException } from '@/core/domain/shared/exceptions/domain.exception';
import type { IAUsageRepository } from '@/core/ports/repositories/ia-usage.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import { Inject, Injectable, Logger } from '@nestjs/common';

export interface ValidateLimitInput {
  subscriptionId: string;
}

export interface RegisterUsageInput {
  subscriptionId: string;
  userId?: string;
  companyId?: string;
  callsUsed: number;
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

@Injectable()
export class IAUsageService {
  private readonly logger = new Logger(IAUsageService.name);

  constructor(
    @Inject('IAUsageRepository')
    private readonly iaUsageRepository: IAUsageRepository,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
  ) {}

  async validateLimit(input: ValidateLimitInput): Promise<void> {
    const stats = await this.getUsageStats(input.subscriptionId);

    if (stats.remaining <= 0) {
      const subscription = await this.subscriptionRepository.findById(
        input.subscriptionId,
      );
      const plan = subscription
        ? await this.planRepository.findById(subscription.planId)
        : null;

      throw new IALimitExceededException(
        stats.used,
        stats.limit,
        plan?.name ?? undefined,
      );
    }

    this.logger.log(
      `AI limit validated for subscription ${input.subscriptionId}: ${stats.remaining} calls remaining`,
    );
  }

  async registerUsage(input: RegisterUsageInput): Promise<void> {
    const iaUsage = new IAUsage(
      this.idGenerator.generate(),
      input.subscriptionId,
      input.userId ?? null,
      input.companyId ?? null,
      input.callsUsed,
      new Date(),
    );

    await this.iaUsageRepository.create(iaUsage);

    this.logger.log(
      `Registered ${input.callsUsed} AI call(s) for subscription ${input.subscriptionId}`,
    );
  }

  async getUsageStats(subscriptionId: string): Promise<UsageStats> {
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const plan = await this.planRepository.findById(subscription.planId);

    if (!plan) {
      throw new Error('Plan not found');
    }

    const used =
      await this.iaUsageRepository.countBySubscriptionId(subscriptionId);

    return {
      used,
      limit: plan.iaCallsLimit,
      remaining: Math.max(0, plan.iaCallsLimit - used),
    };
  }
}

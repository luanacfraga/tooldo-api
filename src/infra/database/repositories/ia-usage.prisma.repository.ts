import { IAUsage } from '@/core/domain/ia-usage/ia-usage.entity';
import type { IAUsageRepository } from '@/core/ports/repositories/ia-usage.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { IAUsage as PrismaIAUsage } from '@prisma/client';

@Injectable()
export class IAUsagePrismaRepository implements IAUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(iaUsage: IAUsage, tx?: unknown): Promise<IAUsage> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.iAUsage.create({
      data: {
        id: iaUsage.id,
        subscriptionId: iaUsage.subscriptionId,
        userId: iaUsage.userId,
        companyId: iaUsage.companyId,
        tokensUsed: iaUsage.tokensUsed,
        createdAt: iaUsage.createdAt,
      },
    });

    return this.mapToDomain(created);
  }

  async countBySubscriptionId(subscriptionId: string): Promise<number> {
    const result = await this.prisma.iAUsage.aggregate({
      where: {
        subscriptionId,
      },
      _sum: {
        tokensUsed: true,
      },
    });

    return result._sum.tokensUsed ?? 0;
  }

  private mapToDomain(prismaIAUsage: PrismaIAUsage): IAUsage {
    return new IAUsage(
      prismaIAUsage.id,
      prismaIAUsage.subscriptionId,
      prismaIAUsage.userId,
      prismaIAUsage.companyId,
      prismaIAUsage.tokensUsed,
      prismaIAUsage.createdAt,
    );
  }
}

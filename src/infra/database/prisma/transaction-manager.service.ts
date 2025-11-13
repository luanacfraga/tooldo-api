import { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return fn(tx);
    });
  }
}

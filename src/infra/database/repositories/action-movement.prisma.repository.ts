import { ActionMovement } from '@/core/domain/action';
import { ActionStatus } from '@/core/domain/shared/enums';
import type { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ActionMovement as PrismaActionMovement } from '@prisma/client';

@Injectable()
export class ActionMovementPrismaRepository
  implements ActionMovementRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    movement: ActionMovement,
    tx?: unknown,
  ): Promise<ActionMovement> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.actionMovement.create({
      data: {
        id: movement.id,
        actionId: movement.actionId,
        fromStatus: movement.fromStatus,
        toStatus: movement.toStatus,
        movedById: movement.movedById,
        movedAt: movement.movedAt,
        notes: movement.notes,
      },
    });

    return this.mapToDomain(created);
  }

  async findByActionId(
    actionId: string,
    tx?: unknown,
  ): Promise<ActionMovement[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const movements = await client.actionMovement.findMany({
      where: { actionId },
      orderBy: { movedAt: 'desc' },
    });

    return movements.map((movement) => this.mapToDomain(movement));
  }

  async findById(id: string, tx?: unknown): Promise<ActionMovement | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const movement = await client.actionMovement.findUnique({
      where: { id },
    });

    return movement ? this.mapToDomain(movement) : null;
  }

  private mapToDomain(prismaMovement: PrismaActionMovement): ActionMovement {
    return new ActionMovement(
      prismaMovement.id,
      prismaMovement.actionId,
      prismaMovement.fromStatus as ActionStatus,
      prismaMovement.toStatus as ActionStatus,
      prismaMovement.movedById,
      prismaMovement.movedAt,
      prismaMovement.notes,
    );
  }
}

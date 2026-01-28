import { ChecklistItem } from '@/core/domain/action/checklist-item.entity';
import type {
  ChecklistItemRepository,
  UpdateChecklistItemData,
} from '@/core/ports/repositories/checklist-item.repository';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChecklistItem as PrismaChecklistItem } from '@prisma/client';

@Injectable()
export class ChecklistItemPrismaRepository implements ChecklistItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(item: ChecklistItem, tx?: unknown): Promise<ChecklistItem> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const created = await client.checklistItem.create({
      data: {
        id: item.id,
        actionId: item.actionId,
        description: item.description,
        isCompleted: item.isCompleted,
        completedAt: item.completedAt,
        order: item.order,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string, tx?: unknown): Promise<ChecklistItem | null> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const item = await client.checklistItem.findUnique({
      where: { id },
    });

    return item ? this.mapToDomain(item) : null;
  }

  async findByActionId(
    actionId: string,
    tx?: unknown,
  ): Promise<ChecklistItem[]> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const items = await client.checklistItem.findMany({
      where: { actionId },
      orderBy: { order: 'asc' },
    });

    return items.map((item) => this.mapToDomain(item));
  }

  async update(
    id: string,
    data: Partial<UpdateChecklistItemData>,
    tx?: unknown,
  ): Promise<ChecklistItem> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    const updated = await client.checklistItem.update({
      where: { id },
      data: {
        description: data.description,
        isCompleted: data.isCompleted,
        completedAt: data.completedAt,
        order: data.order,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string, tx?: unknown): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.checklistItem.delete({
      where: { id },
    });
  }

  async deleteByActionId(actionId: string, tx?: unknown): Promise<void> {
    const client = (tx as typeof this.prisma) ?? this.prisma;
    await client.checklistItem.deleteMany({
      where: { actionId },
    });
  }

  private mapToDomain(prismaItem: PrismaChecklistItem): ChecklistItem {
    return new ChecklistItem(
      prismaItem.id,
      prismaItem.actionId,
      prismaItem.description,
      prismaItem.isCompleted,
      prismaItem.completedAt,
      prismaItem.order,
    );
  }
}

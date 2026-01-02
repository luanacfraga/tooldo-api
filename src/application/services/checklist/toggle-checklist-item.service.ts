import { ChecklistItem } from '@/core/domain/action';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ChecklistItemRepository } from '@/core/ports/repositories/checklist-item.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ToggleChecklistItemInput {
  itemId: string;
}

export interface ToggleChecklistItemOutput {
  item: ChecklistItem;
}

@Injectable()
export class ToggleChecklistItemService {
  constructor(
    @Inject('ChecklistItemRepository')
    private readonly checklistItemRepository: ChecklistItemRepository,
  ) {}

  async execute(
    input: ToggleChecklistItemInput,
  ): Promise<ToggleChecklistItemOutput> {
    console.log('[TOGGLE SERVICE] Finding item:', input.itemId);
    const item = await this.checklistItemRepository.findById(input.itemId);
    if (!item) {
      console.log('[TOGGLE SERVICE] Item not found:', input.itemId);
      throw new EntityNotFoundException('Item da checklist', input.itemId);
    }

    console.log('[TOGGLE SERVICE] Item found, current isCompleted:', item.isCompleted);
    const toggled = item.toggleComplete();
    console.log('[TOGGLE SERVICE] After toggle, new isCompleted:', toggled.isCompleted);

    const updated = await this.checklistItemRepository.update(input.itemId, {
      isCompleted: toggled.isCompleted,
      completedAt: toggled.completedAt,
    });

    console.log('[TOGGLE SERVICE] Update successful, final isCompleted:', updated.isCompleted);
    return {
      item: updated,
    };
  }
}

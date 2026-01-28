import { ChecklistItem } from '@/core/domain/action/checklist-item.entity';
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
    const item = await this.checklistItemRepository.findById(input.itemId);
    if (!item) {
      throw new EntityNotFoundException('Item da checklist', input.itemId);
    }

    const toggled = item.toggleComplete();

    const updated = await this.checklistItemRepository.update(input.itemId, {
      isCompleted: toggled.isCompleted,
      completedAt: toggled.completedAt,
    });

    return {
      item: updated,
    };
  }
}

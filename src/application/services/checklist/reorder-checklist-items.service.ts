import { ChecklistItem } from '@/core/domain/action';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { ChecklistItemRepository } from '@/core/ports/repositories/checklist-item.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ReorderChecklistItemsInput {
  actionId: string;
  itemIds: string[];
}

export interface ReorderChecklistItemsOutput {
  items: ChecklistItem[];
}

@Injectable()
export class ReorderChecklistItemsService {
  constructor(
    @Inject('ChecklistItemRepository')
    private readonly checklistItemRepository: ChecklistItemRepository,
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
  ) {}

  async execute(
    input: ReorderChecklistItemsInput,
  ): Promise<ReorderChecklistItemsOutput> {
    // Verify action exists
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    // Update order for each item
    const updatedItems: ChecklistItem[] = [];
    for (let i = 0; i < input.itemIds.length; i++) {
      const itemId = input.itemIds[i];
      const updated = await this.checklistItemRepository.update(itemId, {
        order: i,
      });
      updatedItems.push(updated);
    }

    return {
      items: updatedItems,
    };
  }
}

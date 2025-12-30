import { ChecklistItem } from '@/core/domain/action';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { ChecklistItemRepository } from '@/core/ports/repositories/checklist-item.repository';
import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface AddChecklistItemInput {
  actionId: string;
  description: string;
  order: number;
}

export interface AddChecklistItemOutput {
  item: ChecklistItem;
}

@Injectable()
export class AddChecklistItemService {
  constructor(
    @Inject('ChecklistItemRepository')
    private readonly checklistItemRepository: ChecklistItemRepository,
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
  ) {}

  async execute(input: AddChecklistItemInput): Promise<AddChecklistItemOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    const item = new ChecklistItem(
      randomUUID(),
      input.actionId,
      input.description,
      false,
      null,
      input.order,
    );

    const created = await this.checklistItemRepository.create(item);

    return {
      item: created,
    };
  }
}

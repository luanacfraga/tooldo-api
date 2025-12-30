import { ChecklistItem } from '@/core/domain/action';

export interface UpdateChecklistItemData {
  description?: string;
  isCompleted?: boolean;
  completedAt?: Date | null;
  order?: number;
}

export interface ChecklistItemRepository {
  create(item: ChecklistItem, tx?: unknown): Promise<ChecklistItem>;
  findById(id: string, tx?: unknown): Promise<ChecklistItem | null>;
  findByActionId(actionId: string, tx?: unknown): Promise<ChecklistItem[]>;
  update(
    id: string,
    data: Partial<UpdateChecklistItemData>,
    tx?: unknown,
  ): Promise<ChecklistItem>;
  delete(id: string, tx?: unknown): Promise<void>;
  deleteByActionId(actionId: string, tx?: unknown): Promise<void>;
}

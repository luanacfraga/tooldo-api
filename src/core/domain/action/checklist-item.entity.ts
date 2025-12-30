import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { DomainValidator } from '../shared/validators/domain.validator';

export class ChecklistItem extends Entity {
  constructor(
    public readonly id: string,
    public readonly actionId: string,
    public readonly description: string,
    public readonly isCompleted: boolean,
    public readonly completedAt: Date | null,
    public readonly order: number,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.CHECKLIST_ITEM.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredId(
      this.actionId,
      ErrorMessages.CHECKLIST_ITEM.ACTION_ID_REQUIRED,
    );
    DomainValidator.validateRequiredString(
      this.description,
      ErrorMessages.CHECKLIST_ITEM.DESCRIPTION_REQUIRED,
    );
    DomainValidator.validateNonNegativeNumber(
      this.order,
      ErrorMessages.CHECKLIST_ITEM.ORDER_INVALID,
    );
  }

  public toggleComplete(): ChecklistItem {
    const newIsCompleted = !this.isCompleted;
    const newCompletedAt = newIsCompleted ? new Date() : null;

    return new ChecklistItem(
      this.id,
      this.actionId,
      this.description,
      newIsCompleted,
      newCompletedAt,
      this.order,
    );
  }
}

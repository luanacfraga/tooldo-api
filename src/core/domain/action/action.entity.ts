import { ErrorMessages } from '@/shared/constants/error-messages';
import { Entity } from '../shared/entity.base';
import { ActionPriority, ActionStatus } from '../shared/enums';
import { DomainValidator } from '../shared/validators/domain.validator';

export class Action extends Entity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly status: ActionStatus,
    public readonly priority: ActionPriority,
    public readonly estimatedStartDate: Date,
    public readonly estimatedEndDate: Date,
    public readonly actualStartDate: Date | null,
    public readonly actualEndDate: Date | null,
    public readonly isLate: boolean,
    public readonly isBlocked: boolean,
    public readonly blockedReason: string | null,
    public readonly companyId: string,
    public readonly teamId: string | null,
    public readonly creatorId: string,
    public readonly responsibleId: string,
    public readonly deletedAt: Date | null = null,
  ) {
    super(id);
    this.validate();
  }

  protected getIdErrorMessage(): string {
    return ErrorMessages.ACTION.ID_REQUIRED;
  }

  protected validate(): void {
    DomainValidator.validateRequiredString(
      this.title,
      ErrorMessages.ACTION.TITLE_REQUIRED,
    );
    DomainValidator.validateRequiredString(
      this.description,
      ErrorMessages.ACTION.DESCRIPTION_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.companyId,
      ErrorMessages.ACTION.COMPANY_ID_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.creatorId,
      ErrorMessages.ACTION.CREATOR_ID_REQUIRED,
    );
    DomainValidator.validateRequiredId(
      this.responsibleId,
      ErrorMessages.ACTION.RESPONSIBLE_ID_REQUIRED,
    );

    // Validate estimated dates
    DomainValidator.validateDate(
      this.estimatedStartDate,
      ErrorMessages.ACTION.ESTIMATED_START_DATE_INVALID,
    );
    DomainValidator.validateDate(
      this.estimatedEndDate,
      ErrorMessages.ACTION.ESTIMATED_END_DATE_INVALID,
    );
    DomainValidator.validateDateAfter(
      this.estimatedEndDate,
      this.estimatedStartDate,
      ErrorMessages.ACTION.ESTIMATED_END_DATE_BEFORE_START,
    );

    // Validate actual dates if present
    if (this.actualStartDate) {
      DomainValidator.validateDate(
        this.actualStartDate,
        ErrorMessages.ACTION.ACTUAL_START_DATE_INVALID,
      );
    }
    if (this.actualEndDate) {
      DomainValidator.validateDate(
        this.actualEndDate,
        ErrorMessages.ACTION.ACTUAL_END_DATE_INVALID,
      );
    }

    // Validate blocked reason
    if (this.isBlocked && !this.blockedReason?.trim()) {
      throw new Error(ErrorMessages.ACTION.BLOCKED_REASON_REQUIRED);
    }
  }

  public calculateIsLate(currentDate: Date = new Date()): boolean {
    // If action is already done, it's not late
    if (this.status === ActionStatus.DONE) {
      return false;
    }

    // If we have an actual end date and it's after estimated end date
    if (this.actualEndDate && this.actualEndDate > this.estimatedEndDate) {
      return true;
    }

    // If we don't have an actual end date yet, check if current date is past estimated end date
    if (!this.actualEndDate && currentDate > this.estimatedEndDate) {
      return true;
    }

    return false;
  }

  public updateStatus(newStatus: ActionStatus): Action {
    const actualStartDate =
      newStatus === ActionStatus.IN_PROGRESS && !this.actualStartDate
        ? new Date()
        : this.actualStartDate;

    const actualEndDate =
      newStatus === ActionStatus.DONE && !this.actualEndDate
        ? new Date()
        : this.actualEndDate;

    const isLate = this.calculateIsLate();

    return new Action(
      this.id,
      this.title,
      this.description,
      newStatus,
      this.priority,
      this.estimatedStartDate,
      this.estimatedEndDate,
      actualStartDate,
      actualEndDate,
      isLate,
      this.isBlocked,
      this.blockedReason,
      this.companyId,
      this.teamId,
      this.creatorId,
      this.responsibleId,
      this.deletedAt,
    );
  }

  public block(reason: string): Action {
    return new Action(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.estimatedStartDate,
      this.estimatedEndDate,
      this.actualStartDate,
      this.actualEndDate,
      this.isLate,
      true,
      reason,
      this.companyId,
      this.teamId,
      this.creatorId,
      this.responsibleId,
      this.deletedAt,
    );
  }

  public unblock(): Action {
    return new Action(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.estimatedStartDate,
      this.estimatedEndDate,
      this.actualStartDate,
      this.actualEndDate,
      this.isLate,
      false,
      null,
      this.companyId,
      this.teamId,
      this.creatorId,
      this.responsibleId,
      this.deletedAt,
    );
  }

  public delete(): Action {
    return new Action(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.estimatedStartDate,
      this.estimatedEndDate,
      this.actualStartDate,
      this.actualEndDate,
      this.isLate,
      this.isBlocked,
      this.blockedReason,
      this.companyId,
      this.teamId,
      this.creatorId,
      this.responsibleId,
      new Date(),
    );
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}

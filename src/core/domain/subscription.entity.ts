export class Subscription {
  constructor(
    public readonly id: string,
    public readonly adminId: string,
    public readonly planId: string,
    public readonly startedAt: Date,
    public readonly isActive: boolean,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id?.trim()) {
      throw new Error('Subscription id is required');
    }
    if (!this.adminId?.trim()) {
      throw new Error('Subscription adminId is required');
    }
    if (!this.planId?.trim()) {
      throw new Error('Subscription planId is required');
    }
    if (!(this.startedAt instanceof Date) || isNaN(this.startedAt.getTime())) {
      throw new Error('Subscription startedAt must be a valid date');
    }
  }

  static create(
    id: string,
    adminId: string,
    planId: string,
    startedAt: Date = new Date(),
  ): Subscription {
    return new Subscription(id, adminId, planId, startedAt, true);
  }
}

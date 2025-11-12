export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly adminId: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id?.trim()) {
      throw new Error('Company id is required');
    }
    if (!this.name?.trim()) {
      throw new Error('Company name is required');
    }
    if (!this.adminId?.trim()) {
      throw new Error('Company adminId is required');
    }
  }
}

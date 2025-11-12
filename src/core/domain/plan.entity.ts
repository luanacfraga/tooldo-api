export class Plan {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly maxCompanies: number,
    public readonly maxManagers: number,
    public readonly maxExecutors: number,
    public readonly maxConsultants: number,
    public readonly iaCallsLimit: number,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id?.trim()) {
      throw new Error('Plan id is required');
    }
    if (!this.name?.trim()) {
      throw new Error('Plan name is required');
    }
    if (this.maxCompanies < 0) {
      throw new Error('Plan maxCompanies must be greater than or equal to 0');
    }
    if (this.maxManagers < 0) {
      throw new Error('Plan maxManagers must be greater than or equal to 0');
    }
    if (this.maxExecutors < 0) {
      throw new Error('Plan maxExecutors must be greater than or equal to 0');
    }
    if (this.maxConsultants < 0) {
      throw new Error('Plan maxConsultants must be greater than or equal to 0');
    }
    if (this.iaCallsLimit < 0) {
      throw new Error('Plan iaCallsLimit must be greater than or equal to 0');
    }
  }
}

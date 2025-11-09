export class Plan {
  constructor(
    public readonly id: string,
    public name: string,
    public maxCompanies: number,
    public maxManagers: number,
    public maxExecutors: number,
    public maxConsultants: number,
    public iaCallsLimit: number,
  ) {}
}

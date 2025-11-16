export class EmployeeInvitedEvent {
  constructor(
    public readonly companyUserId: string,
    public readonly companyId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly role: string,
    public readonly invitedBy: string,
  ) {}
}

export class EmployeeInviteAcceptedEvent {
  constructor(
    public readonly companyUserId: string,
    public readonly companyId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly role: string,
  ) {}
}

export class EmployeeSuspendedEvent {
  constructor(
    public readonly companyUserId: string,
    public readonly companyId: string,
    public readonly userId: string,
  ) {}
}

export class EmployeeActivatedEvent {
  constructor(
    public readonly companyUserId: string,
    public readonly companyId: string,
    public readonly userId: string,
  ) {}
}

export class EmployeeRemovedEvent {
  constructor(
    public readonly companyUserId: string,
    public readonly companyId: string,
    public readonly userId: string,
  ) {}
}

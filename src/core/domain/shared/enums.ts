export enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
}

export enum UserRole {
  MASTER = 'master',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EXECUTOR = 'executor',
  CONSULTANT = 'consultant',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
  PENDING = 'PENDING',
}

export enum CompanyUserStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  REMOVED = 'REMOVED',
}

export enum ActionStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum ActionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ActionLateStatus {
  LATE_TO_START = 'LATE_TO_START',
  LATE_TO_FINISH = 'LATE_TO_FINISH',
  COMPLETED_LATE = 'COMPLETED_LATE',
}

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

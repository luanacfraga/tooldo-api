import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';

export interface CompanyUserRepository {
  create(companyUser: CompanyUser, tx?: unknown): Promise<CompanyUser>;
  findById(id: string, tx?: unknown): Promise<CompanyUser | null>;
  findByCompanyAndUser(
    companyId: string,
    userId: string,
    tx?: unknown,
  ): Promise<CompanyUser | null>;
  findByCompanyId(companyId: string, tx?: unknown): Promise<CompanyUser[]>;
  findByCompanyIdAndStatus(
    companyId: string,
    status: CompanyUserStatus,
    tx?: unknown,
  ): Promise<CompanyUser[]>;
  findByCompanyIdPaginated(
    companyId: string,
    options: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: CompanyUserStatus;
    },
    tx?: unknown,
  ): Promise<{ employees: CompanyUser[]; total: number }>;
  countByAdminIdAndRole(
    adminId: string,
    role: UserRole,
    tx?: unknown,
  ): Promise<number>;
  countByAdminIdRoleAndStatus(
    adminId: string,
    role: UserRole,
    status: CompanyUserStatus,
    tx?: unknown,
  ): Promise<number>;
  update(
    id: string,
    data: Partial<CompanyUser>,
    tx?: unknown,
  ): Promise<CompanyUser>;
  delete(id: string, tx?: unknown): Promise<void>;
}

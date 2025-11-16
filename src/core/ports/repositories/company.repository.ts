import { Company } from '@/core/domain/company/company.entity';

export interface CompanyRepository {
  create(company: Company, tx?: unknown): Promise<Company>;
  countByAdminId(adminId: string): Promise<number>;
}

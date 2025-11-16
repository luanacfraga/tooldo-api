import { Company } from '@/core/domain/company/company.entity';

export interface CompanyRepository {
  create(company: Company, tx?: unknown): Promise<Company>;
  findById(id: string, tx?: unknown): Promise<Company | null>;
  countByAdminId(adminId: string): Promise<number>;
}

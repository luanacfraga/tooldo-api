import { Company } from '@/core/domain/company.entity';

export interface CompanyRepository {
  create(company: Company, tx?: unknown): Promise<Company>;
}

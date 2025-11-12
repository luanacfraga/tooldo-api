import { Company } from '@/core/domain/company.entity';

export interface CompanyRepository {
  create(company: Omit<Company, 'id'>): Promise<Company>;
}

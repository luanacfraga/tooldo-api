import {
  Company,
  UpdateCompanyData,
} from '@/core/domain/company/company.entity';

export interface CompanyRepository {
  create(company: Company, tx?: unknown): Promise<Company>;
  findById(id: string, tx?: unknown): Promise<Company | null>;
  findByAdminId(adminId: string, tx?: unknown): Promise<Company[]>;
  countByAdminId(adminId: string): Promise<number>;
  update(
    id: string,
    data: Partial<UpdateCompanyData>,
    tx?: unknown,
  ): Promise<Company>;
  delete(id: string, tx?: unknown): Promise<void>;
}

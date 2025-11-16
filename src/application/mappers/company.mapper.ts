import { Company } from '@/core/domain/company/company.entity';

export interface CompanyResponseDto {
  id: string;
  name: string;
  description?: string | null;
  adminId: string;
}

export class CompanyMapper {
  static toResponseDto(company: Company): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      description: company.description,
      adminId: company.adminId,
    };
  }
}

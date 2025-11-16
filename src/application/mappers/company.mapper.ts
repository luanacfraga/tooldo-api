import { CompanyResponseDto } from '@/api/auth/dto/register-admin-response.dto';
import { Company } from '@/core/domain/company/company.entity';

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

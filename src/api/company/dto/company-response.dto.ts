import { Company } from '@/core/domain/company/company.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'ID único da empresa',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Tooldo Tecnologia',
  })
  name!: string;

  @ApiProperty({
    description: 'Descrição da empresa',
    example: 'Empresa de tecnologia focada em educação',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'ID do administrador responsável pela empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  adminId!: string;

  static fromDomain(company: Company): CompanyResponseDto {
    const response = new CompanyResponseDto();
    response.id = company.id;
    response.name = company.name;
    response.description = company.description;
    response.adminId = company.adminId;
    return response;
  }
}

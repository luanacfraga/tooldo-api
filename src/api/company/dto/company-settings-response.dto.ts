import { SubscriptionResponseDto } from '@/api/auth/dto/register-admin-response.dto';
import { Company } from '@/core/domain/company/company.entity';
import { Plan } from '@/core/domain/plan/plan.entity';
import { Subscription } from '@/core/domain/subscription/subscription.entity';
import { User } from '@/core/domain/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

class CompanySettingsCompanyDto {
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
  description!: string | null;

  @ApiProperty({
    description: 'ID do administrador responsável pela empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  adminId!: string;

  @ApiProperty({
    description: 'Documento (CPF/CNPJ) do administrador da empresa',
    example: '12345678000199',
  })
  document!: string;

  @ApiProperty({
    description: 'Tipo do documento',
    example: 'CNPJ',
    enum: ['CPF', 'CNPJ'],
  })
  documentType!: string;

  static fromDomain(company: Company, admin: User): CompanySettingsCompanyDto {
    const dto = new CompanySettingsCompanyDto();
    dto.id = company.id;
    dto.name = company.name;
    dto.description = company.description ?? null;
    dto.adminId = company.adminId;
    dto.document = admin.document;
    dto.documentType = admin.documentType;
    return dto;
  }
}

class CompanySettingsPlanDto {
  @ApiProperty({
    description: 'ID do plano',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome do plano',
    example: 'Pro',
  })
  name!: string;

  @ApiProperty({ example: 3 })
  maxCompanies!: number;

  @ApiProperty({ example: 10 })
  maxManagers!: number;

  @ApiProperty({ example: 50 })
  maxExecutors!: number;

  @ApiProperty({ example: 5 })
  maxConsultants!: number;

  @ApiProperty({
    description: 'Limite de tokens/chamadas de IA da assinatura',
    example: 100000,
  })
  iaCallsLimit!: number;

  static fromDomain(plan: Plan): CompanySettingsPlanDto {
    const dto = new CompanySettingsPlanDto();
    dto.id = plan.id;
    dto.name = plan.name;
    dto.maxCompanies = plan.maxCompanies;
    dto.maxManagers = plan.maxManagers;
    dto.maxExecutors = plan.maxExecutors;
    dto.maxConsultants = plan.maxConsultants;
    dto.iaCallsLimit = plan.iaCallsLimit;
    return dto;
  }
}

class CompanySettingsSubscriptionDto extends SubscriptionResponseDto {}

class CompanySettingsAdminDto {
  @ApiProperty({
    description: 'ID do administrador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Primeiro nome do administrador',
    example: 'João',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do administrador',
    example: 'Silva',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Email do administrador',
    example: 'joao.silva@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Telefone do administrador',
    example: '11987654321',
  })
  phone!: string;

  @ApiProperty({
    description: 'Documento do administrador (CPF ou CNPJ)',
    example: '12345678900',
  })
  document!: string;

  @ApiProperty({
    description: 'Tipo de documento',
    example: 'CPF',
    enum: ['CPF', 'CNPJ'],
  })
  documentType!: string;

  @ApiProperty({
    description: 'Papel do administrador no sistema',
    example: 'admin',
  })
  role!: string;

  static fromDomain(user: User): CompanySettingsAdminDto {
    const dto = new CompanySettingsAdminDto();
    dto.id = user.id;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.document = user.document;
    dto.documentType = user.documentType;
    dto.role = user.role;
    return dto;
  }
}

export class CompanySettingsResponseDto {
  @ApiProperty({ type: CompanySettingsCompanyDto })
  company!: CompanySettingsCompanyDto;

  @ApiProperty({ type: CompanySettingsPlanDto })
  plan!: CompanySettingsPlanDto;

  @ApiProperty({ type: CompanySettingsSubscriptionDto })
  subscription!: CompanySettingsSubscriptionDto;

  @ApiProperty({ type: CompanySettingsAdminDto })
  admin!: CompanySettingsAdminDto;

  static fromDomain(input: {
    company: Company;
    plan: Plan;
    subscription: Subscription;
    admin: User;
  }): CompanySettingsResponseDto {
    const dto = new CompanySettingsResponseDto();
    dto.company = CompanySettingsCompanyDto.fromDomain(
      input.company,
      input.admin,
    );
    dto.plan = CompanySettingsPlanDto.fromDomain(input.plan);
    const subscriptionDto = new CompanySettingsSubscriptionDto();
    subscriptionDto.id = input.subscription.id;
    subscriptionDto.adminId = input.subscription.adminId;
    subscriptionDto.planId = input.subscription.planId;
    subscriptionDto.startedAt = input.subscription.startedAt;
    subscriptionDto.isActive = input.subscription.isActive;
    dto.subscription = subscriptionDto;
    dto.admin = CompanySettingsAdminDto.fromDomain(input.admin);
    return dto;
  }
}

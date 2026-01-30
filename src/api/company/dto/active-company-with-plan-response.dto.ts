import { PlanResponseDto } from '@/api/plan/dto/plan-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CompanyResponseDto } from './company-response.dto';

export class SubscriptionInfoDto {
  @ApiProperty({ description: 'ID da assinatura' })
  id!: string;

  @ApiProperty({ description: 'ID do admin' })
  adminId!: string;

  @ApiProperty({ description: 'ID do plano' })
  planId!: string;

  @ApiProperty({ description: 'Data de início' })
  startedAt!: string;

  @ApiProperty({ description: 'Se a assinatura está ativa' })
  isActive!: boolean;
}

export class ActiveCompanyWithPlanResponseDto {
  @ApiProperty({ type: CompanyResponseDto, description: 'Dados da empresa' })
  company!: CompanyResponseDto;

  @ApiProperty({
    type: SubscriptionInfoDto,
    description: 'Assinatura ativa do admin',
  })
  subscription!: SubscriptionInfoDto;

  @ApiProperty({ type: PlanResponseDto, description: 'Plano atual' })
  plan!: PlanResponseDto;

  @ApiProperty({ description: 'Nome do administrador', example: 'João Silva' })
  adminName!: string;
}

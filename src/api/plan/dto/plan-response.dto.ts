import { Plan } from '@/core/domain/plan/plan.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty({
    description: 'ID do plano',
    example: 'uuid-v4',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome do plano',
    example: 'Plano Premium',
  })
  name!: string;

  @ApiProperty({
    description: 'Número máximo de empresas permitidas',
    example: 10,
  })
  maxCompanies!: number;

  @ApiProperty({
    description: 'Número máximo de gerentes permitidos',
    example: 50,
  })
  maxManagers!: number;

  @ApiProperty({
    description: 'Número máximo de executores permitidos',
    example: 100,
  })
  maxExecutors!: number;

  @ApiProperty({
    description: 'Número máximo de consultores permitidos',
    example: 30,
  })
  maxConsultants!: number;

  @ApiProperty({
    description: 'Limite de chamadas de IA por mês',
    example: 1000,
  })
  iaCallsLimit!: number;

  static fromDomain(plan: Plan): PlanResponseDto {
    const response = new PlanResponseDto();
    response.id = plan.id;
    response.name = plan.name;
    response.maxCompanies = plan.maxCompanies;
    response.maxManagers = plan.maxManagers;
    response.maxExecutors = plan.maxExecutors;
    response.maxConsultants = plan.maxConsultants;
    response.iaCallsLimit = plan.iaCallsLimit;
    return response;
  }
}

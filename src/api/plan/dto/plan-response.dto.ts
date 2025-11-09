import { ApiProperty } from '@nestjs/swagger';

export class PlanResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the plan',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the plan',
    example: 'Premium Plan',
  })
  name: string;

  @ApiProperty({
    description: 'Maximum number of companies allowed',
    example: 10,
  })
  maxCompanies: number;

  @ApiProperty({
    description: 'Maximum number of managers allowed',
    example: 50,
  })
  maxManagers: number;

  @ApiProperty({
    description: 'Maximum number of executors allowed',
    example: 100,
  })
  maxExecutors: number;

  @ApiProperty({
    description: 'Maximum number of consultants allowed',
    example: 30,
  })
  maxConsultants: number;

  @ApiProperty({
    description: 'IA calls limit per month',
    example: 1000,
  })
  iaCallsLimit: number;
}

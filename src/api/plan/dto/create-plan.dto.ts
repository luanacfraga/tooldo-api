import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({
    description: 'Name of the plan',
    example: 'Premium Plan',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Maximum number of companies allowed',
    example: 10,
  })
  @IsInt()
  @IsPositive()
  maxCompanies: number;

  @ApiProperty({
    description: 'Maximum number of managers allowed',
    example: 50,
  })
  @IsInt()
  @IsPositive()
  maxManagers: number;

  @ApiProperty({
    description: 'Maximum number of executors allowed',
    example: 100,
  })
  @IsInt()
  @IsPositive()
  maxExecutors: number;

  @ApiProperty({
    description: 'Maximum number of consultants allowed',
    example: 30,
  })
  @IsInt()
  @IsPositive()
  maxConsultants: number;

  @ApiProperty({
    description: 'IA calls limit per month',
    example: 1000,
  })
  @IsInt()
  @IsPositive()
  iaCallsLimit: number;
}

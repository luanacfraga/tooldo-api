import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdatePlanDto {
  @ApiProperty({
    description: 'ID do plano',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'O ID do plano deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do plano é obrigatório' })
  id!: string;

  @ApiProperty({
    description: 'Nome do plano',
    example: 'Plano Premium',
  })
  @IsString({ message: 'O nome do plano deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do plano é obrigatório' })
  name!: string;

  @ApiProperty({
    description: 'Número máximo de empresas permitidas',
    example: 10,
  })
  @IsInt({ message: 'O número máximo de empresas deve ser um inteiro' })
  @IsPositive({ message: 'O número máximo de empresas deve ser positivo' })
  maxCompanies!: number;

  @ApiProperty({
    description: 'Número máximo de gerentes permitidos',
    example: 50,
  })
  @IsInt({ message: 'O número máximo de gerentes deve ser um inteiro' })
  @IsPositive({ message: 'O número máximo de gerentes deve ser positivo' })
  maxManagers!: number;

  @ApiProperty({
    description: 'Número máximo de executores permitidos',
    example: 100,
  })
  @IsInt({ message: 'O número máximo de executores deve ser um inteiro' })
  @IsPositive({ message: 'O número máximo de executores deve ser positivo' })
  maxExecutors!: number;

  @ApiProperty({
    description: 'Número máximo de consultores permitidos',
    example: 30,
  })
  @IsInt({ message: 'O número máximo de consultores deve ser um inteiro' })
  @IsPositive({ message: 'O número máximo de consultores deve ser positivo' })
  maxConsultants!: number;

  @ApiProperty({
    description: 'Limite de chamadas de IA por mês',
    example: 1000,
  })
  @IsInt({ message: 'O limite de chamadas de IA deve ser um inteiro' })
  @IsPositive({ message: 'O limite de chamadas de IA deve ser positivo' })
  iaCallsLimit!: number;
}

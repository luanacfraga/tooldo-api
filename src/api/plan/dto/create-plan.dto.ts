import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePlanDto {
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
  @Min(0, {
    message: 'O número máximo de empresas deve ser maior ou igual a 0',
  })
  maxCompanies!: number;

  @ApiProperty({
    description: 'Número máximo de gerentes permitidos',
    example: 50,
  })
  @IsInt({ message: 'O número máximo de gerentes deve ser um inteiro' })
  @Min(0, {
    message: 'O número máximo de gerentes deve ser maior ou igual a 0',
  })
  maxManagers!: number;

  @ApiProperty({
    description: 'Número máximo de executores permitidos',
    example: 100,
  })
  @IsInt({ message: 'O número máximo de executores deve ser um inteiro' })
  @Min(0, {
    message: 'O número máximo de executores deve ser maior ou igual a 0',
  })
  maxExecutors!: number;

  @ApiProperty({
    description: 'Número máximo de consultores permitidos',
    example: 30,
  })
  @IsInt({ message: 'O número máximo de consultores deve ser um inteiro' })
  @Min(0, {
    message: 'O número máximo de consultores deve ser maior ou igual a 0',
  })
  maxConsultants!: number;

  @ApiProperty({
    description: 'Limite de chamadas de IA por mês (0 = sem chamadas de IA)',
    example: 1000,
  })
  @IsInt({ message: 'O limite de chamadas de IA deve ser um inteiro' })
  @Min(0, { message: 'O limite de chamadas de IA deve ser maior ou igual a 0' })
  iaCallsLimit!: number;
}

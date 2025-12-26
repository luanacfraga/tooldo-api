import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GenerateActionPlanDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'O ID da empresa deve ser um UUID válido' })
  companyId!: string;

  @ApiProperty({
    description: 'ID da equipe (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'O ID da equipe deve ser um UUID válido' })
  teamId?: string;

  @ApiProperty({
    description: 'Objetivo ou meta para o plano de ação',
    example: 'Aumentar produtividade da equipe de desenvolvimento',
  })
  @IsString({ message: 'O objetivo deve ser uma string' })
  @IsNotEmpty({ message: 'O objetivo é obrigatório' })
  goal!: string;
}

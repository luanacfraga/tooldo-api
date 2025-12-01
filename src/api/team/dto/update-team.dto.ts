import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateTeamDto {
  @ApiProperty({
    description: 'Nome da equipe',
    example: 'Equipe de Desenvolvimento Atualizada',
    required: false,
  })
  @IsString({ message: 'O nome da equipe deve ser uma string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descrição da equipe',
    example: 'Equipe responsável pelo desenvolvimento de software',
    required: false,
  })
  @IsString({ message: 'A descrição da equipe deve ser uma string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Contexto de IA para a equipe (máximo 1000 caracteres)',
    example:
      'Equipe responsável por campanhas de mídia paga no setor de varejo',
    required: false,
  })
  @IsString({ message: 'O contexto de IA deve ser uma string' })
  @IsOptional()
  @MaxLength(1000, {
    message: 'O contexto de IA deve ter no máximo 1000 caracteres',
  })
  iaContext?: string;

  @ApiProperty({
    description: 'ID do gestor da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID('4', { message: 'O managerId deve ser um UUID válido' })
  @IsOptional()
  managerId?: string;
}

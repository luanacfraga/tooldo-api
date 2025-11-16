import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty({
    description: 'ID do vínculo CompanyUser (convite)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'O companyUserId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O companyUserId é obrigatório' })
  companyUserId!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaSegura123!',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password!: string;

  @ApiProperty({
    description: 'Telefone do funcionário (se ainda não cadastrado)',
    example: '11987654321',
    required: false,
  })
  @IsString({ message: 'O telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Documento do funcionário (se ainda não cadastrado)',
    example: '12345678900',
    required: false,
  })
  @IsString({ message: 'O documento deve ser uma string' })
  @IsOptional()
  document?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class AcceptInviteByTokenDto {
  @ApiProperty({
    description: 'Token JWT do convite',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'O token deve ser uma string' })
  @IsNotEmpty({ message: 'O token é obrigatório' })
  token!: string;

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

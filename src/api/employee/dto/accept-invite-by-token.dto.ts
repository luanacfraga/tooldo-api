import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AcceptInviteByTokenDto {
  @ApiProperty({
    description: 'Token JWT do convite',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'O token deve ser uma string' })
  @IsNotEmpty({ message: 'O token é obrigatório' })
  token!: string;

  @ApiProperty({
    description: 'CPF do funcionário (deve ser o mesmo do convite)',
    example: '12345678900',
  })
  @IsString({ message: 'O documento deve ser uma string' })
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  document!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'SenhaSegura123!',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password!: string;
}

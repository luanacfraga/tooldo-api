import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty({
    description: 'Iniciais do usuário',
    example: 'JD',
    required: false,
    nullable: true,
  })
  initials?: string | null;

  @ApiProperty({
    description: 'Cor do avatar do usuário',
    example: '#FF5733',
    required: false,
    nullable: true,
  })
  avatarColor?: string | null;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string;

  @ApiProperty({
    description: 'Dados do usuário autenticado',
    type: LoginUserDto,
  })
  user!: LoginUserDto;
}

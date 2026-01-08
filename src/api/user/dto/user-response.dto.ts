import { UserRole, UserStatus } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '+5511999999999',
  })
  phone!: string;

  @ApiProperty({
    description: 'Documento do usuário',
    example: '12345678900',
  })
  document!: string;

  @ApiProperty({
    description: 'Papel do usuário',
    enum: UserRole,
    example: UserRole.EXECUTOR,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Status do usuário',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @ApiProperty({
    description: 'URL da imagem de perfil',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profileImageUrl!: string | null;

  @ApiProperty({
    description: 'Cor do avatar',
    example: '#3B82F6',
    required: false,
  })
  avatarColor!: string | null;

  @ApiProperty({
    description: 'Iniciais do usuário',
    example: 'JD',
    required: false,
  })
  initials!: string | null;
}

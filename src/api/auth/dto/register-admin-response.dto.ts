import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'João',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Silva',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '11987654321',
  })
  phone!: string;

  @ApiProperty({
    description: 'Documento do usuário (CPF ou CNPJ)',
    example: '12345678900',
  })
  document!: string;

  @ApiProperty({
    description: 'Tipo de documento',
    example: 'CPF',
    enum: ['CPF', 'CNPJ'],
  })
  documentType!: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    example: 'admin',
    enum: ['master', 'admin', 'manager', 'executor', 'consultant'],
  })
  role!: string;

  @ApiProperty({
    description: 'Status do usuário',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'DELETED', 'PENDING'],
  })
  status!: string;

  @ApiProperty({
    description: 'URL da imagem de perfil do usuário',
    example: 'https://example.com/profile.jpg',
    required: false,
    nullable: true,
  })
  profileImageUrl?: string | null;
}

export class CompanyResponseDto {
  @ApiProperty({
    description: 'ID único da empresa',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Weedu Tecnologia',
  })
  name!: string;

  @ApiProperty({
    description: 'Descrição da empresa',
    example: 'Empresa de tecnologia focada em educação',
    required: false,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'ID do administrador responsável pela empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  adminId!: string;
}

export class SubscriptionResponseDto {
  @ApiProperty({
    description: 'ID único da assinatura',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  id!: string;

  @ApiProperty({
    description: 'ID do administrador da assinatura',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  adminId!: string;

  @ApiProperty({
    description: 'ID do plano associado à assinatura',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  planId!: string;

  @ApiProperty({
    description: 'Data de início da assinatura',
    example: '2025-11-14T20:00:00.000Z',
    type: Date,
  })
  startedAt!: Date;

  @ApiProperty({
    description: 'Indica se a assinatura está ativa',
    example: true,
  })
  isActive!: boolean;
}

export class RegisterAdminResponseDto {
  @ApiProperty({
    description: 'Dados do usuário administrador criado',
    type: UserResponseDto,
  })
  user!: UserResponseDto;

  @ApiProperty({
    description: 'Dados da empresa criada',
    type: CompanyResponseDto,
  })
  company!: CompanyResponseDto;

  @ApiProperty({
    description: 'Dados da assinatura criada',
    type: SubscriptionResponseDto,
  })
  subscription!: SubscriptionResponseDto;
}

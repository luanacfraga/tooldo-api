import { DocumentType } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CompanyDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Tooldo Tecnologia',
  })
  @IsString({ message: 'O nome da empresa deve ser uma string' })
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório' })
  name!: string;

  @ApiProperty({
    description: 'Descrição da empresa',
    example: 'Empresa de tecnologia focada em educação',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'A descrição da empresa deve ser uma string' })
  description?: string;
}

export class RegisterAdminDto {
  @ApiProperty({
    description: 'Primeiro nome do administrador',
    example: 'João',
  })
  @IsString({ message: 'O primeiro nome deve ser uma string' })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório' })
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do administrador',
    example: 'Silva',
  })
  @IsString({ message: 'O sobrenome deve ser uma string' })
  @IsNotEmpty({ message: 'O sobrenome é obrigatório' })
  lastName!: string;

  @ApiProperty({
    description: 'Email do administrador',
    example: 'joao.silva@example.com',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email!: string;

  @ApiProperty({
    description: 'Senha do administrador (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password!: string;

  @ApiProperty({
    description: 'Telefone do administrador',
    example: '11987654321',
  })
  @IsString({ message: 'O telefone deve ser uma string' })
  phone!: string;

  @ApiProperty({
    description: 'Documento do administrador (CPF ou CNPJ)',
    example: '12345678900',
  })
  @IsString({ message: 'O documento deve ser uma string' })
  document!: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: DocumentType,
    example: DocumentType.CPF,
  })
  @IsEnum(DocumentType, { message: 'O tipo de documento deve ser CPF ou CNPJ' })
  documentType!: DocumentType;

  @ApiProperty({
    description: 'Dados da empresa',
    type: CompanyDto,
  })
  @ValidateNested({ message: 'Os dados da empresa são inválidos' })
  @Type(() => CompanyDto)
  company!: CompanyDto;
}

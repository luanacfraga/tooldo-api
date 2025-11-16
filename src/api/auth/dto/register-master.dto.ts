import { DocumentType } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterMasterDto {
  @ApiProperty({
    description: 'Primeiro nome do usuário master',
    example: 'João',
  })
  @IsString({ message: 'O primeiro nome deve ser uma string' })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório' })
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do usuário master',
    example: 'Silva',
  })
  @IsString({ message: 'O sobrenome deve ser uma string' })
  @IsNotEmpty({ message: 'O sobrenome é obrigatório' })
  lastName!: string;

  @ApiProperty({
    description: 'Email do usuário master',
    example: 'master@example.com',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário master (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password!: string;

  @ApiProperty({
    description: 'Telefone do usuário master',
    example: '11987654321',
  })
  @IsString({ message: 'O telefone deve ser uma string' })
  phone!: string;

  @ApiProperty({
    description: 'Documento do usuário master (CPF ou CNPJ)',
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
}

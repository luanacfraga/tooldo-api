import { DocumentType } from '@/core/domain/enums';
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
  @IsString({ message: 'O nome da empresa deve ser uma string' })
  @IsNotEmpty({ message: 'O nome da empresa é obrigatório' })
  name: string;

  @IsOptional()
  @IsString({ message: 'A descrição da empresa deve ser uma string' })
  description?: string;
}

export class RegisterAdminDto {
  @IsString({ message: 'O primeiro nome deve ser uma string' })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório' })
  firstName: string;

  @IsString({ message: 'O sobrenome deve ser uma string' })
  @IsNotEmpty({ message: 'O sobrenome é obrigatório' })
  lastName: string;

  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @IsString({ message: 'O telefone deve ser uma string' })
  phone: string;

  @IsString({ message: 'O documento deve ser uma string' })
  document: string;

  @IsEnum(DocumentType, { message: 'O tipo de documento deve ser CPF ou CNPJ' })
  documentType: DocumentType;

  @ValidateNested({ message: 'Os dados da empresa são inválidos' })
  @Type(() => CompanyDto)
  company: CompanyDto;
}

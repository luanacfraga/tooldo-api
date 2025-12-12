import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserRole } from '@/core/domain/shared/enums';

export class InviteEmployeeDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'O companyId deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O companyId é obrigatório' })
  companyId!: string;

  @ApiProperty({
    description: 'Email do funcionário a ser convidado',
    example: 'funcionario@empresa.com',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email!: string;

  @ApiProperty({
    description: 'Primeiro nome do funcionário',
    example: 'João',
  })
  @IsString({ message: 'O primeiro nome deve ser uma string' })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório' })
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do funcionário',
    example: 'Silva',
  })
  @IsString({ message: 'O sobrenome deve ser uma string' })
  @IsNotEmpty({ message: 'O sobrenome é obrigatório' })
  lastName!: string;

  @ApiProperty({
    description: 'Telefone do funcionário',
    example: '11987654321',
    required: false,
  })
  @IsString({ message: 'O telefone deve ser uma string' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Documento do funcionário (CPF)',
    example: '12345678900',
    required: false,
  })
  @IsString({ message: 'O documento deve ser uma string' })
  @IsOptional()
  document?: string;

  @ApiProperty({
    description: 'Cargo do funcionário na empresa',
    enum: [UserRole.MANAGER, UserRole.EXECUTOR, UserRole.CONSULTANT],
    example: UserRole.EXECUTOR,
  })
  @IsEnum(UserRole, {
    message: 'O cargo deve ser: manager, executor ou consultant',
  })
  @IsNotEmpty({ message: 'O cargo é obrigatório' })
  role!: UserRole;

  @ApiProperty({
    description: 'Posição/função específica do funcionário',
    example: 'Pintor',
    required: false,
  })
  @IsString({ message: 'A posição deve ser uma string' })
  @IsOptional()
  position?: string;

  @ApiProperty({
    description: 'Notas ou observações sobre o funcionário',
    example: 'Responsável pela obra 1',
    required: false,
  })
  @IsString({ message: 'As notas devem ser uma string' })
  @IsOptional()
  notes?: string;
}

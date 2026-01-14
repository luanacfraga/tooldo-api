import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@/core/domain/shared/enums';

export class UpdateEmployeeDto {
  @ApiProperty({
    description: 'Primeiro nome do funcionário',
    example: 'João',
    required: false,
  })
  @IsString({ message: 'O primeiro nome deve ser uma string' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Sobrenome do funcionário',
    example: 'Silva',
    required: false,
  })
  @IsString({ message: 'O sobrenome deve ser uma string' })
  @IsOptional()
  lastName?: string;

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

  @ApiProperty({
    description: 'Cargo do funcionário na empresa',
    enum: [UserRole.MANAGER, UserRole.EXECUTOR, UserRole.CONSULTANT],
    example: UserRole.EXECUTOR,
    required: false,
  })
  @IsEnum(UserRole, {
    message: 'O cargo deve ser: manager, executor ou consultant',
  })
  @IsOptional()
  role?: UserRole;
}


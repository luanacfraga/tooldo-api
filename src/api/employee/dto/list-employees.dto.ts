import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CompanyUserStatus } from '@/core/domain/shared/enums';

export class ListEmployeesQueryDto {
  @ApiProperty({
    description: 'Filtrar por status do funcionário',
    enum: CompanyUserStatus,
    required: false,
    example: CompanyUserStatus.ACTIVE,
  })
  @IsEnum(CompanyUserStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: CompanyUserStatus;

  @ApiProperty({
    description: 'Número da página',
    required: false,
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página deve ser maior ou igual a 1' })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    required: false,
    example: 10,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Limite deve ser um número inteiro' })
  @Min(1, { message: 'Limite deve ser maior ou igual a 1' })
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Campo para ordenação',
    required: false,
    example: 'createdAt',
  })
  @IsString({ message: 'Campo de ordenação deve ser uma string' })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Direção da ordenação',
    required: false,
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsEnum(['asc', 'desc'], { message: 'Direção de ordenação deve ser asc ou desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Tooldo Tecnologia Atualizada',
    required: false,
  })
  @IsString({ message: 'O nome da empresa deve ser uma string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Descrição da empresa',
    example: 'Empresa de tecnologia focada em educação',
    required: false,
  })
  @IsString({ message: 'A descrição da empresa deve ser uma string' })
  @IsOptional()
  description?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
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
}

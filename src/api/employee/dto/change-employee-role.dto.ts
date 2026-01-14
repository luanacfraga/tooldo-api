import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@/core/domain/shared/enums';

export class ChangeEmployeeRoleDto {
  @ApiProperty({
    description: 'Novo cargo do funcionário',
    enum: [UserRole.MANAGER, UserRole.EXECUTOR, UserRole.CONSULTANT],
    example: UserRole.MANAGER,
  })
  @IsEnum(UserRole, {
    message: 'O cargo deve ser: manager, executor ou consultant',
  })
  @IsNotEmpty({ message: 'O novo cargo é obrigatório' })
  newRole!: UserRole;
}

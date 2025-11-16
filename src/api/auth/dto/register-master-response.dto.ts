import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './register-admin-response.dto';

export class RegisterMasterResponseDto {
  @ApiProperty({
    description: 'Dados do usuário master criado',
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}

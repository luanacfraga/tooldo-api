import { AVATAR_COLORS } from '@/shared/constants/avatar-colors';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateAvatarColorDto {
  @ApiProperty({
    description: 'Cor do avatar escolhida pelo usuário',
    example: '#3B82F6',
    enum: AVATAR_COLORS,
  })
  @IsString({ message: 'A cor do avatar deve ser uma string' })
  @IsIn(AVATAR_COLORS, {
    message: 'A cor do avatar deve ser uma das cores predefinidas',
  })
  avatarColor!: string;
}

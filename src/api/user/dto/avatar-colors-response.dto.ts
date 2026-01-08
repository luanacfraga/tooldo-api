import { AVATAR_COLORS } from '@/shared/constants/avatar-colors';
import { ApiProperty } from '@nestjs/swagger';

export class AvatarColorsResponseDto {
  @ApiProperty({
    description: 'Lista de cores disponíveis para o avatar',
    example: AVATAR_COLORS,
    type: [String],
  })
  colors!: readonly string[];

  static create(): AvatarColorsResponseDto {
    const dto = new AvatarColorsResponseDto();
    dto.colors = AVATAR_COLORS;
    return dto;
  }
}

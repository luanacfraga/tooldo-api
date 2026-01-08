import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { UserMapper } from '@/application/mappers/user.mapper';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { UpdateUserAvatarColorService } from '@/application/services/user/update-user-avatar-color.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvatarColorsResponseDto } from './dto/avatar-colors-response.dto';
import { UpdateAvatarColorDto } from './dto/update-avatar-color.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly updateUserAvatarColorService: UpdateUserAvatarColorService,
  ) {}

  @Get('me/avatar-colors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List available avatar colors',
    description: 'Returns the predefined palette of colors available for avatar customization',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available colors returned successfully',
    type: AvatarColorsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  async getAvatarColors(): Promise<AvatarColorsResponseDto> {
    return AvatarColorsResponseDto.create();
  }

  @Patch('me/avatar-color')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update avatar color',
    description: 'Updates the authenticated user\'s avatar color to one from the predefined palette',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar color updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid color (not in palette)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  async updateAvatarColor(
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateAvatarColorDto: UpdateAvatarColorDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserAvatarColorService.execute({
      userId: currentUser.sub,
      avatarColor: updateAvatarColorDto.avatarColor,
    });

    return UserMapper.toResponseDto(user);
  }
}

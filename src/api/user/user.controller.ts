import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { Roles } from '@/api/auth/decorators/roles.decorator';
import { PaginatedResponseDto } from '@/api/shared/dto/paginated-response.dto';
import { UserMapper } from '@/application/mappers/user.mapper';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { ListUsersService } from '@/application/services/user/list-users.service';
import { UpdateUserAvatarColorService } from '@/application/services/user/update-user-avatar-color.service';
import { UserRole } from '@/core/domain/shared/enums';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvatarColorsResponseDto } from './dto/avatar-colors-response.dto';
import { UpdateAvatarColorDto } from './dto/update-avatar-color.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly updateUserAvatarColorService: UpdateUserAvatarColorService,
    private readonly listUsersService: ListUsersService,
  ) {}

  @Get()
  @Roles(UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar usuários',
    description:
      'Lista usuários com paginação, filtrando opcionalmente por papel (role). Apenas usuários MASTER podem acessar.',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filtrar por papel do usuário',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  async list(
    @Query('role') role?: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const result = await this.listUsersService.execute({
      role,
      page,
      limit,
    });

    return {
      data: result.users.map((user) => UserMapper.toResponseDto(user)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.totalPages > 0 && result.page < result.totalPages,
        hasPreviousPage: result.totalPages > 0 && result.page > 1,
      },
    };
  }

  @Get('me/avatar-colors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List available avatar colors',
    description:
      'Returns the predefined palette of colors available for avatar customization',
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
  getAvatarColors(): AvatarColorsResponseDto {
    return AvatarColorsResponseDto.create();
  }

  @Patch('me/avatar-color')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update avatar color',
    description:
      "Updates the authenticated user's avatar color to one from the predefined palette",
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

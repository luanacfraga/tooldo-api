import { LoginUserDto } from '@/api/auth/dto/login-response.dto';
import { UserResponseDto } from '@/api/auth/dto/register-admin-response.dto';
import { User } from '@/core/domain/user/user.entity';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      document: user.document,
      documentType: user.documentType,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profileImageUrl,
      initials: user.initials,
      avatarColor: user.avatarColor,
    };
  }

  static toLoginDto(user: User): LoginUserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      initials: user.initials,
      avatarColor: user.avatarColor,
    };
  }
}

import { LoginUserDto } from '@/api/auth/dto/login-response.dto';
import { UserResponseDto } from '@/api/user/dto/user-response.dto';
import { User } from '@/core/domain/user/user.entity';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.document = user.document;
    dto.documentType = user.documentType;
    dto.role = user.role;
    dto.status = user.status;
    dto.profileImageUrl = user.profileImageUrl;
    dto.avatarColor = user.avatarColor;
    dto.initials = user.initials;
    return dto;
  }

  static toLoginDto(user: User): LoginUserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      initials: user.initials,
      avatarColor: user.avatarColor,
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  document: string;

  @ApiProperty()
  documentType: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  profileImageUrl?: string | null;
}

export class CompanyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty()
  adminId: string;
}

export class SubscriptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  adminId: string;

  @ApiProperty()
  planId: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  isActive: boolean;
}

export class RegisterAdminResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: CompanyResponseDto })
  company: CompanyResponseDto;

  @ApiProperty({ type: SubscriptionResponseDto })
  subscription: SubscriptionResponseDto;
}

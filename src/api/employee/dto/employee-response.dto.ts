import { ApiProperty } from '@nestjs/swagger';
import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';

export interface CompanyUserWithUser extends CompanyUser {
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    document: string;
    role: string;
    initials?: string | null;
  };
}

export class EmployeeResponseDto {
  @ApiProperty({
    description: 'ID do vínculo do funcionário com a empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId!: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Cargo do funcionário',
    enum: UserRole,
    example: UserRole.EXECUTOR,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Status do funcionário',
    enum: CompanyUserStatus,
    example: CompanyUserStatus.ACTIVE,
  })
  status!: CompanyUserStatus;

  @ApiProperty({
    description: 'Posição/função do funcionário',
    example: 'Pintor',
    required: false,
  })
  position!: string | null;

  @ApiProperty({
    description: 'Notas sobre o funcionário',
    example: 'Responsável pela obra 1',
    required: false,
  })
  notes!: string | null;

  @ApiProperty({
    description: 'Data em que o convite foi enviado',
    example: '2025-11-16T20:00:00Z',
    required: false,
  })
  invitedAt!: Date | null;

  @ApiProperty({
    description: 'ID de quem enviou o convite',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  invitedBy!: string | null;

  @ApiProperty({
    description: 'Data em que o convite foi aceito',
    example: '2025-11-16T20:00:00Z',
    required: false,
  })
  acceptedAt!: Date | null;

  @ApiProperty({
    description: 'Dados do usuário',
    required: false,
  })
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    document: string;
    role: string;
    initials?: string | null;
  };

  static fromDomain(
    companyUser: CompanyUser | CompanyUserWithUser,
  ): EmployeeResponseDto {
    const dto = new EmployeeResponseDto();
    dto.id = companyUser.id;
    dto.companyId = companyUser.companyId;
    dto.userId = companyUser.userId;
    dto.role = companyUser.role;
    dto.status = companyUser.status;
    dto.position = companyUser.position;
    dto.notes = companyUser.notes;
    dto.invitedAt = companyUser.invitedAt;
    dto.invitedBy = companyUser.invitedBy;
    dto.acceptedAt = companyUser.acceptedAt;

    if ('user' in companyUser && companyUser.user) {
      dto.user = {
        id: companyUser.user.id,
        firstName: companyUser.user.firstName,
        lastName: companyUser.user.lastName,
        email: companyUser.user.email,
        phone: companyUser.user.phone,
        document: companyUser.user.document,
        role: companyUser.user.role,
        initials: companyUser.user.initials,
      };
    }

    return dto;
  }
}

import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import { DomainValidationException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ValidatePlanLimitsService {
  constructor(
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
  ) {}

  async validateRoleLimit(
    adminId: string,
    role: UserRole,
    maxLimit: number,
  ): Promise<void> {
    const currentCount =
      await this.companyUserRepository.countByAdminIdRoleAndStatus(
        adminId,
        role,
        CompanyUserStatus.ACTIVE,
      );

    if (currentCount >= maxLimit) {
      const errorMessage = this.getErrorMessageForRole(role);
      throw new DomainValidationException(errorMessage);
    }
  }

  private getErrorMessageForRole(role: UserRole): string {
    switch (role) {
      case UserRole.MANAGER:
        return ErrorMessages.COMPANY_USER.MAX_MANAGERS_EXCEEDED;
      case UserRole.EXECUTOR:
        return ErrorMessages.COMPANY_USER.MAX_EXECUTORS_EXCEEDED;
      case UserRole.CONSULTANT:
        return ErrorMessages.COMPANY_USER.MAX_CONSULTANTS_EXCEEDED;
      default:
        return 'Limite do plano excedido';
    }
  }
}

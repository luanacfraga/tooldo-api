import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ActivateEmployeeInput {
  companyUserId: string;
}

export interface ActivateEmployeeOutput {
  companyUser: CompanyUser;
}

@Injectable()
export class ActivateEmployeeService {
  constructor(
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
  ) {}

  async execute(input: ActivateEmployeeInput): Promise<ActivateEmployeeOutput> {
    const companyUser = await this.companyUserRepository.findById(
      input.companyUserId,
    );

    if (!companyUser) {
      throw new EntityNotFoundException('Funcionário', input.companyUserId);
    }

    if (!companyUser.canBeActivated()) {
      throw new DomainValidationException(
        'Este funcionário não pode ser ativado',
      );
    }

    const updatedCompanyUser = await this.companyUserRepository.update(
      companyUser.id,
      {
        status: CompanyUserStatus.ACTIVE,
      } as Partial<CompanyUser>,
    );

    return {
      companyUser: updatedCompanyUser,
    };
  }
}

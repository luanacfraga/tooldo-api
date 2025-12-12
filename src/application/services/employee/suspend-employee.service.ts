import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface SuspendEmployeeInput {
  companyUserId: string;
}

export interface SuspendEmployeeOutput {
  companyUser: CompanyUser;
}

@Injectable()
export class SuspendEmployeeService {
  constructor(
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
  ) {}

  async execute(input: SuspendEmployeeInput): Promise<SuspendEmployeeOutput> {
    const companyUser = await this.companyUserRepository.findById(
      input.companyUserId,
    );

    if (!companyUser) {
      throw new EntityNotFoundException('Funcionário', input.companyUserId);
    }

    if (!companyUser.canBeSuspended()) {
      throw new DomainValidationException(
        'Este funcionário não pode ser suspenso',
      );
    }

    const updatedCompanyUser = await this.companyUserRepository.update(
      companyUser.id,
      {
        status: CompanyUserStatus.SUSPENDED,
      } as Partial<CompanyUser>,
    );

    return {
      companyUser: updatedCompanyUser,
    };
  }
}

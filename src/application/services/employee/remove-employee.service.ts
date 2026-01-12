import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface RemoveEmployeeInput {
  companyUserId: string;
}

export interface RemoveEmployeeOutput {
  companyUser: CompanyUser;
}

@Injectable()
export class RemoveEmployeeService {
  constructor(
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
  ) {}

  async execute(input: RemoveEmployeeInput): Promise<RemoveEmployeeOutput> {
    const companyUser = await this.companyUserRepository.findById(
      input.companyUserId,
    );

    if (!companyUser) {
      throw new EntityNotFoundException('Funcionário', input.companyUserId);
    }

    if (!companyUser.canBeRemoved()) {
      throw new DomainValidationException(
        'Este funcionário não pode ser removido',
      );
    }

    // Marcação lógica como REMOVED (remoção do vínculo sem apagar histórico).
    const removedCompanyUser = await this.companyUserRepository.update(
      companyUser.id,
      {
        status: CompanyUserStatus.REMOVED,
      },
    );

    return {
      companyUser: removedCompanyUser,
    };
  }
}

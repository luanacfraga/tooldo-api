import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListEmployeesInput {
  companyId: string;
  status?: CompanyUserStatus;
}

export interface ListEmployeesOutput {
  employees: CompanyUser[];
}

@Injectable()
export class ListEmployeesService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
  ) {}

  async execute(input: ListEmployeesInput): Promise<ListEmployeesOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    let employees: CompanyUser[];

    if (input.status) {
      employees = await this.companyUserRepository.findByCompanyIdAndStatus(
        input.companyId,
        input.status,
      );
    } else {
      employees = await this.companyUserRepository.findByCompanyId(
        input.companyId,
      );
    }

    return {
      employees,
    };
  }
}

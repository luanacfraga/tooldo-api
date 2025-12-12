import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListEmployeesInput {
  companyId: string;
  status?: CompanyUserStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListEmployeesOutput {
  employees: CompanyUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const sortBy = input.sortBy ?? 'createdAt';
    const sortOrder = input.sortOrder ?? 'desc';

    const result = await this.companyUserRepository.findByCompanyIdPaginated(
      input.companyId,
      {
        page,
        limit,
        sortBy,
        sortOrder,
        status: input.status,
      },
    );

    const totalPages = Math.ceil(result.total / limit);

    return {
      employees: result.employees,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }
}

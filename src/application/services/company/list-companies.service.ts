import { Company } from '@/core/domain/company/company.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListCompaniesInput {
  adminId: string;
}

export interface ListCompaniesOutput {
  companies: Company[];
}

@Injectable()
export class ListCompaniesService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ListCompaniesInput): Promise<ListCompaniesOutput> {
    const admin = await this.userRepository.findById(input.adminId);
    if (!admin) {
      throw new EntityNotFoundException('Administrador', input.adminId);
    }

    const companies = await this.companyRepository.findByAdminId(input.adminId);

    return {
      companies,
    };
  }
}

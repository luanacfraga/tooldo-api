import { Company } from '@/core/domain/company/company.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface SetCompanyBlockedInput {
  companyId: string;
  blocked: boolean;
}

export interface SetCompanyBlockedOutput {
  company: Company;
}

@Injectable()
export class SetCompanyBlockedService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(
    input: SetCompanyBlockedInput,
  ): Promise<SetCompanyBlockedOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    const updated = await this.companyRepository.update(input.companyId, {
      isBlocked: input.blocked,
    });

    return { company: updated };
  }
}

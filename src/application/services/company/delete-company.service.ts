import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface DeleteCompanyInput {
  id: string;
}

@Injectable()
export class DeleteCompanyService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: DeleteCompanyInput): Promise<void> {
    const company = await this.companyRepository.findById(input.id);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.id);
    }

    await this.companyRepository.delete(input.id);
  }
}

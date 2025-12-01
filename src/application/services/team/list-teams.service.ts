import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { Team } from '@/core/domain/team/team.entity';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListTeamsInput {
  companyId: string;
}

export interface ListTeamsOutput {
  teams: Team[];
}

@Injectable()
export class ListTeamsService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: ListTeamsInput): Promise<ListTeamsOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    const teams = await this.teamRepository.findByCompanyId(input.companyId);

    return {
      teams,
    };
  }
}

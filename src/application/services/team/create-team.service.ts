import { UserRole } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { Team } from '@/core/domain/team/team.entity';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface CreateTeamInput {
  companyId: string;
  name: string;
  description?: string;
  iaContext?: string;
  managerId: string;
}

export interface CreateTeamOutput {
  team: Team;
}

@Injectable()
export class CreateTeamService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: CreateTeamInput): Promise<CreateTeamOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    await this.validateManager(input.companyId, input.managerId);

    const existingTeams = await this.teamRepository.findByManagerId(
      input.managerId,
    );

    if (existingTeams.length > 0) {
      throw new DomainValidationException(
        ErrorMessages.TEAM.MANAGER_ALREADY_IN_TEAM,
      );
    }

    const teamId = this.idGenerator.generate();

    const team = new Team(
      teamId,
      input.name,
      input.description ?? null,
      input.iaContext ?? null,
      input.companyId,
      input.managerId,
    );

    const createdTeam = await this.teamRepository.create(team);

    return {
      team: createdTeam,
    };
  }

  private async validateManager(
    companyId: string,
    managerId: string,
  ): Promise<void> {
    const companyUser = await this.companyUserRepository.findByCompanyAndUser(
      companyId,
      managerId,
    );

    if (!companyUser) {
      throw new DomainValidationException(ErrorMessages.TEAM.MANAGER_NOT_FOUND);
    }

    if (companyUser.role !== UserRole.MANAGER) {
      throw new DomainValidationException(
        ErrorMessages.TEAM.MANAGER_NOT_MANAGER_ROLE,
      );
    }
  }
}

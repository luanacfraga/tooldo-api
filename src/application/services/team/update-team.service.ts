import { UserRole } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { Team, UpdateTeamData } from '@/core/domain/team/team.entity';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdateTeamInput {
  id: string;
  name?: string;
  description?: string;
  iaContext?: string;
  managerId?: string;
}

export interface UpdateTeamOutput {
  team: Team;
}

@Injectable()
export class UpdateTeamService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
  ) {}

  async execute(input: UpdateTeamInput): Promise<UpdateTeamOutput> {
    const team = await this.teamRepository.findById(input.id);
    if (!team) {
      throw new EntityNotFoundException('Equipe', input.id);
    }

    if (input.managerId && input.managerId !== team.managerId) {
      await this.validateManager(team.companyId, input.managerId);
    }

    const updateData: Partial<UpdateTeamData> = {};
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.iaContext !== undefined) {
      updateData.iaContext = input.iaContext;
    }
    if (input.managerId !== undefined) {
      updateData.managerId = input.managerId;
    }

    const updatedTeam = await this.teamRepository.update(input.id, updateData);

    return {
      team: updatedTeam,
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

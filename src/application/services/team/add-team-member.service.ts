import { UserRole } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
  UniqueConstraintException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { TeamUser } from '@/core/domain/team-user/team-user.entity';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface AddTeamMemberInput {
  teamId: string;
  userId: string;
}

export interface AddTeamMemberOutput {
  teamUser: TeamUser;
}

@Injectable()
export class AddTeamMemberService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
  ) {}

  async execute(input: AddTeamMemberInput): Promise<AddTeamMemberOutput> {
    const team = await this.teamRepository.findById(input.teamId);
    if (!team) {
      throw new EntityNotFoundException('Equipe', input.teamId);
    }

    await this.validateExecutor(team.companyId, input.userId);

    const existingTeamUser = await this.teamUserRepository.findByTeamAndUser(
      input.teamId,
      input.userId,
    );

    if (existingTeamUser) {
      throw new UniqueConstraintException(
        'Executor',
        ErrorMessages.TEAM_USER.ALREADY_EXISTS,
      );
    }

    const teamUserId = this.idGenerator.generate();

    const teamUser = new TeamUser(teamUserId, input.teamId, input.userId);

    const createdTeamUser = await this.teamUserRepository.create(teamUser);

    return {
      teamUser: createdTeamUser,
    };
  }

  private async validateExecutor(
    companyId: string,
    userId: string,
  ): Promise<void> {
    const companyUser = await this.companyUserRepository.findByCompanyAndUser(
      companyId,
      userId,
    );

    if (!companyUser) {
      throw new DomainValidationException(
        ErrorMessages.TEAM.EXECUTOR_NOT_FOUND,
      );
    }

    if (companyUser.role !== UserRole.EXECUTOR) {
      throw new DomainValidationException(
        ErrorMessages.TEAM.EXECUTOR_NOT_EXECUTOR_ROLE,
      );
    }
  }
}

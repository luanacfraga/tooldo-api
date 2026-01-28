import { Team } from '@/core/domain/team/team.entity';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListTeamsByManagerInput {
  managerId: string;
  companyId?: string;
}

export interface ListTeamsByManagerOutput {
  teams: Team[];
}

@Injectable()
export class ListTeamsByManagerService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
  ) {}

  async execute(
    input: ListTeamsByManagerInput,
  ): Promise<ListTeamsByManagerOutput> {
    const teams = await this.teamRepository.findByManagerId(input.managerId);

    const filteredTeams = input.companyId
      ? teams.filter((team) => team.companyId === input.companyId)
      : teams;

    return {
      teams: filteredTeams,
    };
  }
}

import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { TeamUser } from '@/core/domain/team-user/team-user.entity';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListTeamMembersInput {
  teamId: string;
}

export interface ListTeamMembersOutput {
  members: TeamUser[];
}

@Injectable()
export class ListTeamMembersService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  async execute(input: ListTeamMembersInput): Promise<ListTeamMembersOutput> {
    const team = await this.teamRepository.findById(input.teamId);
    if (!team) {
      throw new EntityNotFoundException('Equipe', input.teamId);
    }

    const members = await this.teamUserRepository.findByTeamId(input.teamId);

    return {
      members,
    };
  }
}

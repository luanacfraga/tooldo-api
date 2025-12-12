import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface RemoveTeamMemberInput {
  id: string;
}

@Injectable()
export class RemoveTeamMemberService {
  constructor(
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  async execute(input: RemoveTeamMemberInput): Promise<void> {
    const teamUser = await this.teamUserRepository.findById(input.id);
    if (!teamUser) {
      throw new EntityNotFoundException('Membro da equipe', input.id);
    }

    await this.teamUserRepository.delete(input.id);
  }
}

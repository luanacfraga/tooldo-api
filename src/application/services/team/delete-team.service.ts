import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface DeleteTeamInput {
  id: string;
}

@Injectable()
export class DeleteTeamService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
  ) {}

  async execute(input: DeleteTeamInput): Promise<void> {
    const team = await this.teamRepository.findById(input.id);
    if (!team) {
      throw new EntityNotFoundException('Equipe', input.id);
    }

    await this.teamRepository.delete(input.id);
  }
}

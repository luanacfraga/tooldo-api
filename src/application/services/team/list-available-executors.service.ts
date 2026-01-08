import { ListExecutorsService } from '@/application/services/employee/list-executors.service';
import type { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListAvailableExecutorsForTeamInput {
  teamId: string;
}

export interface ListAvailableExecutorsForTeamOutput {
  executors: CompanyUser[];
}

@Injectable()
export class ListAvailableExecutorsForTeamService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    private readonly listExecutorsService: ListExecutorsService,
  ) {}

  async execute(
    input: ListAvailableExecutorsForTeamInput,
  ): Promise<ListAvailableExecutorsForTeamOutput> {
    const team = await this.teamRepository.findById(input.teamId);

    if (!team) {
      throw new EntityNotFoundException('Equipe', input.teamId);
    }

    const result = await this.listExecutorsService.execute({
      companyId: team.companyId,
      excludeTeamId: team.id,
    });

    return {
      executors: result.executors,
    };
  }
}

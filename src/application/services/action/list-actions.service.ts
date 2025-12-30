import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type {
  ActionRepository,
  ActionWithChecklistItems,
} from '@/core/ports/repositories/action.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListActionsInput {
  companyId?: string;
  teamId?: string;
  responsibleId?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  isLate?: boolean;
  isBlocked?: boolean;
}

export interface ListActionsOutput {
  results: ActionWithChecklistItems[];
}

@Injectable()
export class ListActionsService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
  ) {}

  async execute(input: ListActionsInput): Promise<ListActionsOutput> {
    let results: ActionWithChecklistItems[];

    if (input.companyId) {
      const company = await this.companyRepository.findById(input.companyId);
      if (!company) {
        throw new EntityNotFoundException('Empresa', input.companyId);
      }

      results = await this.actionRepository.findByCompanyIdWithChecklistItems(
        input.companyId,
        {
          status: input.status,
          priority: input.priority,
          teamId: input.teamId,
          responsibleId: input.responsibleId,
          isLate: input.isLate,
          isBlocked: input.isBlocked,
        },
      );
    } else if (input.teamId) {
      const team = await this.teamRepository.findById(input.teamId);
      if (!team) {
        throw new EntityNotFoundException('Equipe', input.teamId);
      }

      results = await this.actionRepository.findByTeamIdWithChecklistItems(
        input.teamId,
        {
          status: input.status,
          priority: input.priority,
          responsibleId: input.responsibleId,
          isLate: input.isLate,
          isBlocked: input.isBlocked,
        },
      );
    } else if (input.responsibleId) {
      results =
        await this.actionRepository.findByResponsibleIdWithChecklistItems(
          input.responsibleId,
          {
            status: input.status,
            priority: input.priority,
            isLate: input.isLate,
            isBlocked: input.isBlocked,
          },
        );
    } else {
      results = [];
    }

    return {
      results,
    };
  }
}

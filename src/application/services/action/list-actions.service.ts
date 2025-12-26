import { Action } from '@/core/domain/action';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
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
  actions: Action[];
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
    let actions: Action[];

    if (input.companyId) {
      const company = await this.companyRepository.findById(input.companyId);
      if (!company) {
        throw new EntityNotFoundException('Empresa', input.companyId);
      }

      actions = await this.actionRepository.findByCompanyId(input.companyId, {
        status: input.status,
        priority: input.priority,
        teamId: input.teamId,
        responsibleId: input.responsibleId,
        isLate: input.isLate,
        isBlocked: input.isBlocked,
      });
    } else if (input.teamId) {
      const team = await this.teamRepository.findById(input.teamId);
      if (!team) {
        throw new EntityNotFoundException('Equipe', input.teamId);
      }

      actions = await this.actionRepository.findByTeamId(input.teamId, {
        status: input.status,
        priority: input.priority,
        responsibleId: input.responsibleId,
        isLate: input.isLate,
        isBlocked: input.isBlocked,
      });
    } else if (input.responsibleId) {
      actions = await this.actionRepository.findByResponsibleId(
        input.responsibleId,
        {
          status: input.status,
          priority: input.priority,
          isLate: input.isLate,
          isBlocked: input.isBlocked,
        },
      );
    } else {
      actions = [];
    }

    return {
      actions,
    };
  }
}

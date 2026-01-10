import { Action } from '@/core/domain/action';
import { ActionPriority } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdateActionInput {
  actionId: string;
  title?: string;
  description?: string;
  priority?: ActionPriority;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  responsibleId?: string;
  teamId?: string;
  actualStartDate?: Date;
  actualEndDate?: Date;
}

export interface UpdateActionOutput {
  action: Action;
}

@Injectable()
export class UpdateActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateActionInput): Promise<UpdateActionOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    if (input.responsibleId) {
      const responsible = await this.userRepository.findById(
        input.responsibleId,
      );
      if (!responsible) {
        throw new EntityNotFoundException(
          'Usuário responsável',
          input.responsibleId,
        );
      }
    }

    const estimatedStartDate =
      input.estimatedStartDate ?? action.estimatedStartDate;
    const estimatedEndDate = input.estimatedEndDate ?? action.estimatedEndDate;

    if (estimatedEndDate < estimatedStartDate) {
      throw new DomainValidationException(
        ErrorMessages.ACTION.ESTIMATED_END_DATE_BEFORE_START,
      );
    }

    const updated = await this.actionRepository.update(input.actionId, {
      title: input.title,
      description: input.description,
      priority: input.priority,
      estimatedStartDate: input.estimatedStartDate,
      estimatedEndDate: input.estimatedEndDate,
      actualStartDate: input.actualStartDate,
      actualEndDate: input.actualEndDate,
      responsibleId: input.responsibleId,
      teamId: input.teamId,
    });

    return {
      action: updated,
    };
  }
}

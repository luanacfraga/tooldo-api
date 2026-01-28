import { Action } from '@/core/domain/action/action.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface DeleteActionInput {
  actionId: string;
}

export interface DeleteActionOutput {
  action: Action;
}

@Injectable()
export class DeleteActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
  ) {}

  async execute(input: DeleteActionInput): Promise<DeleteActionOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    const deleted = await this.actionRepository.softDelete(input.actionId);

    return {
      action: deleted,
    };
  }
}

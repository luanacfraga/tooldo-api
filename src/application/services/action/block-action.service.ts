import { Action } from '@/core/domain/action';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface BlockActionInput {
  actionId: string;
  reason: string;
}

export interface BlockActionOutput {
  action: Action;
}

@Injectable()
export class BlockActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
  ) {}

  async execute(input: BlockActionInput): Promise<BlockActionOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    const updated = await this.actionRepository.update(input.actionId, {
      isBlocked: true,
      blockedReason: input.reason,
    });

    return {
      action: updated,
    };
  }
}

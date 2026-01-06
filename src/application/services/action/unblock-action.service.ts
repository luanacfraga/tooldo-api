import { Action } from '@/core/domain/action';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface UnblockActionInput {
  actionId: string;
}

export interface UnblockActionOutput {
  action: Action;
}

@Injectable()
export class UnblockActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
  ) {}

  async execute(input: UnblockActionInput): Promise<UnblockActionOutput> {
    const action = await this.actionRepository.findById(input.actionId);
    if (!action) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }

    const updated = await this.actionRepository.update(input.actionId, {
      isBlocked: false,
      blockedReason: null,
    });

    return {
      action: updated,
    };
  }
}

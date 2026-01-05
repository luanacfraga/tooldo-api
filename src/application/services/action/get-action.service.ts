import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository, ActionWithChecklistItems } from '@/core/ports/repositories/action.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface GetActionInput {
  actionId: string;
}

export interface GetActionOutput {
  result: ActionWithChecklistItems;
}

@Injectable()
export class GetActionService {
  constructor(
    @Inject('ActionRepository')
    private readonly actionRepository: ActionRepository,
  ) {}

  async execute(input: GetActionInput): Promise<GetActionOutput> {
    const result = await this.actionRepository.findByIdWithChecklistItems(input.actionId);
    if (!result) {
      throw new EntityNotFoundException('Ação', input.actionId);
    }
    return { result };
  }
}



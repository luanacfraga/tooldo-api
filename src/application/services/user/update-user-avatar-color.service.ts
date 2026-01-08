import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdateUserAvatarColorInput {
  userId: string;
  avatarColor: string;
}

@Injectable()
export class UpdateUserAvatarColorService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserAvatarColorInput): Promise<User> {
    const existingUser = await this.userRepository.findById(input.userId);
    if (!existingUser) {
      throw new EntityNotFoundException('Usuário', input.userId);
    }

    return this.userRepository.update(existingUser.id, {
      avatarColor: input.avatarColor,
    });
  }
}

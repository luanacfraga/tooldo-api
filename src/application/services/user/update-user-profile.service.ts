import type { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdateUserProfileInput {
  userId: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class UpdateUserProfileService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserProfileInput): Promise<User> {
    const updateData: Record<string, unknown> = {};

    if (typeof input.phone === 'string') {
      updateData.phone = input.phone;
    }

    if (typeof input.firstName === 'string') {
      updateData.firstName = input.firstName;
    }

    if (typeof input.lastName === 'string') {
      updateData.lastName = input.lastName;
    }

    return this.userRepository.update(
      input.userId,
      updateData as Partial<User>,
    );
  }
}

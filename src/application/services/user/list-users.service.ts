import { UserRole } from '@/core/domain/shared/enums';
import type { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface ListUsersInput {
  role?: UserRole;
  page?: number;
  limit?: number;
}

export interface ListUsersOutput {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ListUsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    if (!input.role) {
      return {
        users: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const result = await this.userRepository.findByRolePaginated(
      input.role,
      page,
      limit,
    );

    const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

    return {
      users: result.users,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }
}

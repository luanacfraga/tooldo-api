import { UserRole } from '@/core/domain/shared/enums';
import { User } from '@/core/domain/user/user.entity';

export interface UserRepository {
  findByEmail(email: string, tx?: unknown): Promise<User | null>;
  findByPhone(phone: string, tx?: unknown): Promise<User | null>;
  findByDocument(document: string, tx?: unknown): Promise<User | null>;
  findById(id: string, tx?: unknown): Promise<User | null>;
  findByRefreshToken(refreshToken: string, tx?: unknown): Promise<User | null>;
  create(user: User, tx?: unknown): Promise<User>;
  update(id: string, data: Partial<User>, tx?: unknown): Promise<User>;
  updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    expiresAt: Date | null,
    tx?: unknown,
  ): Promise<void>;

  findByRolePaginated(
    role: UserRole,
    page: number,
    limit: number,
    tx?: unknown,
  ): Promise<{ users: User[]; total: number }>;
}

import { User } from '@/core/domain/user/user.entity';
import { UserRole } from '@/core/domain/shared/enums';

export interface UserRepository {
  findByEmail(email: string, tx?: unknown): Promise<User | null>;
  findByPhone(phone: string, tx?: unknown): Promise<User | null>;
  findByDocument(document: string, tx?: unknown): Promise<User | null>;
  findById(id: string, tx?: unknown): Promise<User | null>;
  create(user: User, tx?: unknown): Promise<User>;
  update(id: string, data: Partial<User>, tx?: unknown): Promise<User>;

  /**
   * Lista usuários por papel com paginação.
   * Mantém a lógica de seleção segura (sem avatarColor/initials no select).
   */
  findByRolePaginated(
    role: UserRole,
    page: number,
    limit: number,
    tx?: unknown,
  ): Promise<{ users: User[]; total: number }>;
}

import { User } from '@/core/domain/user/user.entity';

export interface UserRepository {
  findByEmail(email: string, tx?: unknown): Promise<User | null>;
  findByPhone(phone: string, tx?: unknown): Promise<User | null>;
  findByDocument(document: string, tx?: unknown): Promise<User | null>;
  findById(id: string, tx?: unknown): Promise<User | null>;
  create(user: User, tx?: unknown): Promise<User>;
}

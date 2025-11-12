import { User } from '@/core/domain/user.entity';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByDocument(document: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

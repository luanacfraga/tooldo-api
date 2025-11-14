import { UserRole } from '@/core/domain/shared/enums';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator para definir roles permitidas em uma rota
 * @param roles - Array de roles permitidas
 * @example
 * @Roles(UserRole.ADMIN, UserRole.MASTER)
 * @Get('admin-only')
 * getAdminData() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

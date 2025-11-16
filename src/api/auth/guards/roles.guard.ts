import type { JwtPayload } from '@/application/services/auth/auth.service';
import { ROLES_KEY } from '@/api/auth/decorators/roles.decorator';
import { UserRole } from '@/core/domain/shared/enums';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}

import type { JwtPayload } from '@/application/services/auth.service';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obter o usuário atual do request
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

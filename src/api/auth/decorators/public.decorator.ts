import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator para marcar rotas como públicas (não requerem autenticação)
 * @example
 * @Public()
 * @Get('public-route')
 * getPublicData() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

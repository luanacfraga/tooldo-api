import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

type UnauthorizedExceptionResponse =
  | string
  | { message?: string; error?: string; statusCode?: number };

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse: UnauthorizedExceptionResponse =
      exception.getResponse();

    const messageFromObject =
      typeof exceptionResponse === 'object'
        ? exceptionResponse.message
        : undefined;
    const messageString =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : messageFromObject;

    const isTokenExpired =
      messageFromObject === 'jwt expired' ||
      messageString?.includes('jwt expired') === true;

    const isInvalidToken =
      messageFromObject === 'invalid token' ||
      messageFromObject === 'jwt malformed' ||
      messageString?.includes('invalid token') === true ||
      messageString?.includes('jwt malformed') === true;

    let errorMessage = 'Token de autenticação inválido';
    let errorCode = 'INVALID_TOKEN';

    if (isTokenExpired) {
      errorMessage = 'Token de autenticação expirado';
      errorCode = 'TOKEN_EXPIRED';
    } else if (isInvalidToken) {
      errorMessage = 'Token de autenticação inválido ou malformado';
      errorCode = 'INVALID_TOKEN';
    }

    response.status(HttpStatus.UNAUTHORIZED).json({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: errorMessage,
      error: 'Unauthorized',
      code: errorCode,
      timestamp: new Date().toISOString(),
    });
  }
}

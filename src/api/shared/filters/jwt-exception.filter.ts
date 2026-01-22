import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse: any = exception.getResponse();

    // Detecta se é um erro de token expirado
    const isTokenExpired =
      exceptionResponse?.message === 'jwt expired' ||
      (typeof exceptionResponse === 'string' &&
        exceptionResponse.includes('jwt expired'));

    // Detecta se é um erro de token inválido
    const isInvalidToken =
      exceptionResponse?.message === 'invalid token' ||
      exceptionResponse?.message === 'jwt malformed' ||
      (typeof exceptionResponse === 'string' &&
        (exceptionResponse.includes('invalid token') ||
          exceptionResponse.includes('jwt malformed')));

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

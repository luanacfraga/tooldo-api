import {
  AuthenticationException,
  DomainException,
  DomainValidationException,
  EntityNotFoundException,
  IALimitExceededException,
  UniqueConstraintException,
} from '@/core/domain/shared/exceptions/domain.exception';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;
    let metadata: Record<string, unknown> | undefined;

    if (exception instanceof DomainValidationException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof UniqueConstraintException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof AuthenticationException) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof IALimitExceededException) {
      status = HttpStatus.PAYMENT_REQUIRED;
      metadata = {
        used: exception.used,
        limit: exception.limit,
        planName: exception.planName,
      };
    }

    const responseBody: Record<string, unknown> = {
      statusCode: status,
      message,
      error: exception.name,
      timestamp: new Date().toISOString(),
    };

    if (metadata) {
      responseBody.metadata = metadata;
    }

    response.status(status).json(responseBody);
  }
}

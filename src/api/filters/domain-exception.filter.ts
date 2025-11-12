import {
  DomainException,
  DomainValidationException,
  EntityNotFoundException,
  UniqueConstraintException,
} from '@/core/domain/exceptions/domain.exception';
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

    if (exception instanceof DomainValidationException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof UniqueConstraintException) {
      status = HttpStatus.CONFLICT;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
      timestamp: new Date().toISOString(),
    });
  }
}

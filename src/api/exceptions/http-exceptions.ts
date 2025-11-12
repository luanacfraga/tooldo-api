import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}

export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} com identificador '${identifier}' não foi encontrado(a)`
      : `${resource} não foi encontrado(a)`;
    super(message);
  }
}

export class ResourceConflictException extends ConflictException {
  constructor(field: string, value?: string) {
    const message = value
      ? `${field} '${value}' já está cadastrado`
      : `${field} já está cadastrado`;
    super(message);
  }
}

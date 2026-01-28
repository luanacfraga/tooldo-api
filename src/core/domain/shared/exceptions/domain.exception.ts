export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DomainValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier?: string) {
    const message = identifier
      ? `${entityName} com identificador '${identifier}' não foi encontrado(a)`
      : `${entityName} não foi encontrado(a)`;
    super(message);
  }
}

export class UniqueConstraintException extends DomainException {
  constructor(field: string, value?: string) {
    const message = value
      ? `${field} '${value}' já está cadastrado`
      : `${field} já está cadastrado`;
    super(message);
  }
}

export class AuthenticationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class IALimitExceededException extends DomainException {
  constructor(
    public readonly used: number,
    public readonly limit: number,
    public readonly planName?: string,
  ) {
    const message = planName
      ? `Limite de chamadas de IA excedido para o plano ${planName}. Usado: ${used}/${limit}`
      : `Limite de chamadas de IA excedido. Usado: ${used}/${limit}`;
    super(message);
  }
}

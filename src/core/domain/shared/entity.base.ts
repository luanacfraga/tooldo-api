import { DomainValidator } from './validators/domain.validator';

export abstract class Entity {
  constructor(public readonly id: string) {
    this.validateId();
  }

  private validateId(): void {
    DomainValidator.validateRequiredId(this.id, this.getIdErrorMessage());
  }

  protected abstract getIdErrorMessage(): string;
  protected abstract validate(): void;
}

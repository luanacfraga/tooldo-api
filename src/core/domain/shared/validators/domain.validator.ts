import { DomainValidationException } from '../exceptions/domain.exception';

export class DomainValidator {
  static validateRequiredString(
    value: string | null | undefined,
    errorMessage: string,
  ): void {
    if (!value?.trim()) {
      throw new DomainValidationException(errorMessage);
    }
  }

  static validateRequiredId(
    id: string | null | undefined,
    errorMessage: string,
  ): void {
    if (!id?.trim()) {
      throw new DomainValidationException(errorMessage);
    }
  }

  static validateNonNegativeNumber(value: number, errorMessage: string): void {
    if (value < 0) {
      throw new DomainValidationException(errorMessage);
    }
  }

  static validateDate(date: Date, errorMessage: string): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new DomainValidationException(errorMessage);
    }
  }
}

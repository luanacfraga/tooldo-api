import { IdGenerator } from '@/core/ports/services/id-generator.port';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}

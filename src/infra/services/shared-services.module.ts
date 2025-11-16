import { CryptoIdGenerator } from '@/infra/services/id-generator.service';
import { BcryptPasswordHasher } from '@/infra/services/password-hasher.service';
import { ClassProvider, Module } from '@nestjs/common';

const passwordHasherProvider: ClassProvider = {
  provide: 'PasswordHasher',
  useClass: BcryptPasswordHasher,
};

const idGeneratorProvider: ClassProvider = {
  provide: 'IdGenerator',
  useClass: CryptoIdGenerator,
};

@Module({
  providers: [passwordHasherProvider, idGeneratorProvider],
  exports: ['PasswordHasher', 'IdGenerator'],
})
export class SharedServicesModule {}

import { ID_GENERATOR, PASSWORD_HASHER } from '@/core/di/tokens';
import { CryptoIdGenerator } from '@/infra/services/id-generator.service';
import { BcryptPasswordHasher } from '@/infra/services/password-hasher.service';
import { ClassProvider, Module } from '@nestjs/common';

const passwordHasherProvider: ClassProvider = {
  provide: PASSWORD_HASHER,
  useClass: BcryptPasswordHasher,
};

const idGeneratorProvider: ClassProvider = {
  provide: ID_GENERATOR,
  useClass: CryptoIdGenerator,
};

@Module({
  providers: [passwordHasherProvider, idGeneratorProvider],
  exports: [PASSWORD_HASHER, ID_GENERATOR],
})
export class SharedServicesModule {}

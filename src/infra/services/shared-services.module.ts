import { ConsoleEmailService } from '@/infra/services/email/console-email.service';
import { CryptoIdGenerator } from '@/infra/services/id-generator.service';
import { JwtInviteTokenService } from '@/infra/services/invite-token.service';
import { BcryptPasswordHasher } from '@/infra/services/password-hasher.service';
import { ClassProvider, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

const passwordHasherProvider: ClassProvider = {
  provide: 'PasswordHasher',
  useClass: BcryptPasswordHasher,
};

const idGeneratorProvider: ClassProvider = {
  provide: 'IdGenerator',
  useClass: CryptoIdGenerator,
};

const emailServiceProvider: ClassProvider = {
  provide: 'EmailService',
  useClass: ConsoleEmailService,
};

const inviteTokenServiceProvider: ClassProvider = {
  provide: 'InviteTokenService',
  useClass: JwtInviteTokenService,
};

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    passwordHasherProvider,
    idGeneratorProvider,
    emailServiceProvider,
    inviteTokenServiceProvider,
  ],
  exports: [
    'PasswordHasher',
    'IdGenerator',
    'EmailService',
    'InviteTokenService',
  ],
})
export class SharedServicesModule {}

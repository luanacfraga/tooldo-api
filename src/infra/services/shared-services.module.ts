import { ConsoleEmailService } from '@/infra/services/email/console-email.service';
import { NodemailerEmailService } from '@/infra/services/email/nodemailer-email.service';
import { CryptoIdGenerator } from '@/infra/services/id-generator.service';
import { JwtInviteTokenService } from '@/infra/services/invite-token.service';
import { BcryptPasswordHasher } from '@/infra/services/password-hasher.service';
import { JwtPasswordResetTokenService } from '@/infra/services/password-reset-token.service';
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

// Usa NodemailerEmailService se SMTP estiver configurado, caso contrário usa ConsoleEmailService
const emailServiceProvider: ClassProvider = {
  provide: 'EmailService',
  useClass:
    process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? NodemailerEmailService
      : ConsoleEmailService,
};

const inviteTokenServiceProvider: ClassProvider = {
  provide: 'InviteTokenService',
  useClass: JwtInviteTokenService,
};

const passwordResetTokenServiceProvider: ClassProvider = {
  provide: 'PasswordResetTokenService',
  useClass: JwtPasswordResetTokenService,
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
    passwordResetTokenServiceProvider,
  ],
  exports: [
    'PasswordHasher',
    'IdGenerator',
    'EmailService',
    'InviteTokenService',
    'PasswordResetTokenService',
  ],
})
export class SharedServicesModule {}

import { StubAIService } from '@/infra/services/ai/stub-ai.service';
import { ConsoleEmailService } from '@/infra/services/email/console-email.service';
import { NodemailerEmailService } from '@/infra/services/email/nodemailer-email.service';
import { ResendEmailService } from '@/infra/services/email/resend-email.service';
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

const emailServiceProvider: ClassProvider = {
  provide: 'EmailService',
  // Default behavior (especially for local/dev): do NOT depend on external email providers.
  // This prevents local envs from breaking when a RESEND_API_KEY is present but the domain isn't verified.
  useClass:
    process.env.NODE_ENV === 'production' &&
    process.env.EMAIL_PROVIDER === 'resend' &&
    process.env.RESEND_API_KEY
      ? ResendEmailService
      : process.env.SMTP_USER && process.env.SMTP_PASSWORD
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

const aiServiceProvider: ClassProvider = {
  provide: 'AIService',
  useClass: StubAIService,
};

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    passwordHasherProvider,
    idGeneratorProvider,
    emailServiceProvider,
    inviteTokenServiceProvider,
    passwordResetTokenServiceProvider,
    aiServiceProvider,
  ],
  exports: [
    'PasswordHasher',
    'IdGenerator',
    'EmailService',
    'InviteTokenService',
    'PasswordResetTokenService',
    'AIService',
  ],
})
export class SharedServicesModule {}

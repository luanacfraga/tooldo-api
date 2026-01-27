import { OpenAIService } from '@/infra/services/ai/openai.service';
import { StubAIService } from '@/infra/services/ai/stub-ai.service';
import { ConsoleEmailService } from '@/infra/services/email/console-email.service';
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
  // Usa sempre o fluxo de envio via Resend quando a RESEND_API_KEY estiver configurada.
  // Caso contrário, cai para o ConsoleEmailService para ambientes locais/dev.
  useClass: process.env.RESEND_API_KEY
    ? ResendEmailService
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
  // Usa OpenAIService quando OPENAI_API_KEY estiver configurada.
  // Caso contrário, cai para StubAIService para ambientes locais/dev.
  useClass: process.env.OPENAI_API_KEY ? OpenAIService : StubAIService,
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

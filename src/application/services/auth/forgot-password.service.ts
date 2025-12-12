import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { EmailService } from '@/core/ports/services/email-service.port';
import type { PasswordResetTokenService } from '@/core/ports/services/password-reset-token.port';
import { Inject, Injectable } from '@nestjs/common';

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordOutput {
  message: string;
}

@Injectable()
export class ForgotPasswordService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('EmailService')
    private readonly emailService: EmailService,
    @Inject('PasswordResetTokenService')
    private readonly passwordResetTokenService: PasswordResetTokenService,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return {
        message:
          'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
      };
    }

    const resetToken = this.passwordResetTokenService.generateResetToken({
      userId: user.id,
      email: user.email,
    });

    await this.emailService.sendPasswordReset({
      to: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      resetToken,
    });

    return {
      message:
        'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
    };
  }
}

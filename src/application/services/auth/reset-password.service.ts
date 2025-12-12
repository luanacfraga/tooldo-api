import {
  AuthenticationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import type { PasswordResetTokenService } from '@/core/ports/services/password-reset-token.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ResetPasswordOutput {
  message: string;
}

@Injectable()
export class ResetPasswordService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    @Inject('PasswordResetTokenService')
    private readonly passwordResetTokenService: PasswordResetTokenService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const tokenPayload = this.passwordResetTokenService.verifyResetToken(
      input.token,
    );

    const user = await this.userRepository.findById(tokenPayload.userId);

    if (!user) {
      throw new EntityNotFoundException('Usuário', tokenPayload.userId);
    }

    if (user.email !== tokenPayload.email) {
      throw new AuthenticationException(ErrorMessages.AUTH.INVALID_TOKEN);
    }

    const hashedPassword = await this.passwordHasher.hash(input.newPassword);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    } as Partial<User>);

    return {
      message: 'Senha redefinida com sucesso.',
    };
  }
}

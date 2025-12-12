import type {
  PasswordResetTokenPayload,
  PasswordResetTokenService,
} from '@/core/ports/services/password-reset-token.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtPasswordResetTokenService implements PasswordResetTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateResetToken(payload: PasswordResetTokenPayload): string {
    return this.jwtService.sign(
      {
        userId: payload.userId,
        email: payload.email,
        type: 'password_reset',
      },
      {
        expiresIn: '1h',
        secret: process.env.JWT_RESET_SECRET ?? process.env.JWT_SECRET,
      },
    );
  }

  verifyResetToken(token: string): PasswordResetTokenPayload {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_RESET_SECRET ?? process.env.JWT_SECRET,
      });

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException(ErrorMessages.AUTH.INVALID_TOKEN);
      }

      return {
        userId: payload.userId,
        email: payload.email,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        ErrorMessages.AUTH.INVALID_OR_EXPIRED_RESET_TOKEN,
      );
    }
  }
}

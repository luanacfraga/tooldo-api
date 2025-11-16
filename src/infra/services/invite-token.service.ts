import type {
  InviteTokenPayload,
  InviteTokenService,
} from '@/core/ports/services/invite-token.port';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtInviteTokenService implements InviteTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateInviteToken(payload: InviteTokenPayload): string {
    return this.jwtService.sign(
      {
        companyUserId: payload.companyUserId,
        companyId: payload.companyId,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'employee_invite',
      },
      {
        expiresIn: '7d', // Invite expires in 7 days
        secret: process.env.JWT_INVITE_SECRET || process.env.JWT_SECRET,
      },
    );
  }

  verifyInviteToken(token: string): InviteTokenPayload {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_INVITE_SECRET || process.env.JWT_SECRET,
      });

      if (payload.type !== 'employee_invite') {
        throw new UnauthorizedException('Token inválido');
      }

      return {
        companyUserId: payload.companyUserId,
        companyId: payload.companyId,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de convite inválido ou expirado');
    }
  }
}

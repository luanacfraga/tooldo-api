import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import { AuthenticationException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface LoginInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface LoginOutput {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateRefreshToken(userId: string): Promise<string> {
    const secret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      'your-secret-key-change-me';

    const expiresInConfig =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '30d';

    const expiresInSeconds = this.parseExpiresIn(expiresInConfig);

    const payload: Record<string, string> = {
      sub: userId,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresInSeconds,
    });
  }

  private parseExpiresIn(expiresIn: string): number {
    const days = parseInt(expiresIn.replace('d', ''), 10);
    return days * 24 * 60 * 60;
  }

  private getRefreshTokenExpirationDate(): Date {
    const expirationString =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '30d';
    const days = parseInt(expirationString.replace('d', ''), 10);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate;
  }

  async login(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AuthenticationException(ErrorMessages.AUTH.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AuthenticationException(ErrorMessages.AUTH.INVALID_CREDENTIALS);
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MASTER) {
      const companyUsers = await this.companyUserRepository.findByUserId(
        user.id,
      );

      if (companyUsers.length > 0) {
        const hasActiveCompany = companyUsers.some(
          (cu) => cu.status === CompanyUserStatus.ACTIVE,
        );

        if (!hasActiveCompany) {
          throw new AuthenticationException(ErrorMessages.AUTH.USER_SUSPENDED);
        }
      }
    }

    await this.assertNoBlockedCompanyAccess(user.id, user.role);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.generateRefreshToken(user.id);
    const refreshTokenExpiresAt = this.getRefreshTokenExpirationDate();

    await this.userRepository.updateRefreshToken(
      user.id,
      refresh_token,
      refreshTokenExpiresAt,
    );

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<LoginOutput> {
    const user = await this.userRepository.findByRefreshToken(refreshToken);

    if (!user) {
      throw new AuthenticationException(ErrorMessages.AUTH.INVALID_CREDENTIALS);
    }

    await this.assertNoBlockedCompanyAccess(user.id, user.role);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    const new_refresh_token = await this.generateRefreshToken(user.id);
    const refreshTokenExpiresAt = this.getRefreshTokenExpirationDate();

    await this.userRepository.updateRefreshToken(
      user.id,
      new_refresh_token,
      refreshTokenExpiresAt,
    );

    return {
      access_token,
      refresh_token: new_refresh_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null, null);
  }

  private async assertNoBlockedCompanyAccess(
    userId: string,
    role: UserRole,
  ): Promise<void> {
    if (role === UserRole.MASTER) {
      return;
    }

    const companyIds: string[] = [];

    if (role === UserRole.ADMIN) {
      const adminCompanies = await this.companyRepository.findByAdminId(
        userId,
      );
      companyIds.push(...adminCompanies.map((c) => c.id));
    } else {
      const companyUsers = await this.companyUserRepository.findByUserId(
        userId,
      );
      const activeMemberships = companyUsers.filter(
        (cu) => cu.status === CompanyUserStatus.ACTIVE,
      );
      companyIds.push(...activeMemberships.map((cu) => cu.companyId));
    }

    for (const companyId of companyIds) {
      const company = await this.companyRepository.findById(companyId);
      if (company?.isBlocked) {
        throw new AuthenticationException(
          ErrorMessages.AUTH.COMPANY_BLOCKED,
        );
      }
    }
  }
}

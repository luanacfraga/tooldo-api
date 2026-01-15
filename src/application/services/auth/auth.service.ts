import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import { AuthenticationException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
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
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

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

    // Verifica se o usuário está suspenso (apenas para não-admins)
    // Admins não são suspensos via CompanyUser, então podem sempre fazer login
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MASTER) {
      const companyUsers = await this.companyUserRepository.findByUserId(
        user.id,
      );

      // Se o usuário não tem nenhuma empresa vinculada, permite login
      // Mas se tem empresas e todas estão suspensas, bloqueia
      if (companyUsers.length > 0) {
        const hasActiveCompany = companyUsers.some(
          (cu) => cu.status === CompanyUserStatus.ACTIVE,
        );

        if (!hasActiveCompany) {
          throw new AuthenticationException(ErrorMessages.AUTH.USER_SUSPENDED);
        }
      }
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}

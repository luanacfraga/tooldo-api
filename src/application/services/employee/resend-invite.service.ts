import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { EmailService } from '@/core/ports/services/email-service.port';
import type { InviteTokenService } from '@/core/ports/services/invite-token.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';

export interface ResendInviteInput {
  companyUserId: string;
  invitedById: string;
}

export interface ResendInviteOutput {
  companyUser: CompanyUser;
}

@Injectable()
export class ResendInviteService {
  constructor(
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('EmailService')
    private readonly emailService: EmailService,
    @Inject('InviteTokenService')
    private readonly inviteTokenService: InviteTokenService,
  ) {}

  async execute(input: ResendInviteInput): Promise<ResendInviteOutput> {
    const companyUser = await this.companyUserRepository.findById(
      input.companyUserId,
    );

    if (!companyUser) {
      throw new EntityNotFoundException('Convite', input.companyUserId);
    }

    if (!companyUser.isInvited()) {
      throw new DomainValidationException(
        ErrorMessages.COMPANY_USER.INVITE_CANNOT_BE_ACCEPTED,
      );
    }

    const company = await this.companyRepository.findById(
      companyUser.companyId,
    );
    if (!company) {
      throw new EntityNotFoundException('Empresa', companyUser.companyId);
    }

    const user = await this.userRepository.findById(companyUser.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuário', companyUser.userId);
    }

    const inviter = await this.userRepository.findById(input.invitedById);
    const inviterName = inviter
      ? `${inviter.firstName} ${inviter.lastName}`
      : 'Administrador';

    // Gerar novo token de convite
    const inviteToken = this.inviteTokenService.generateInviteToken({
      companyUserId: companyUser.id,
      companyId: companyUser.companyId,
      userId: user.id,
      email: user.email,
      role: companyUser.role,
      document: user.document,
    });

    // Atualizar data do convite
    const updatedCompanyUser = await this.companyUserRepository.update(
      companyUser.id,
      {
        invitedAt: new Date(),
        invitedBy: input.invitedById,
      } as Partial<CompanyUser>,
    );

    // Enviar email de convite
    await this.emailService.sendEmployeeInvite({
      to: user.email,
      employeeName: `${user.firstName} ${user.lastName}`,
      companyName: company.name,
      inviteToken,
      inviterName,
      role: updatedCompanyUser.role,
    });

    return {
      companyUser: updatedCompanyUser,
    };
  }
}

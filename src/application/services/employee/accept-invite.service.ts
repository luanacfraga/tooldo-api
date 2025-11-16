import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { EmployeeInviteAcceptedEvent } from '@/core/domain/events/employee.events';
import { Plan } from '@/core/domain/plan/plan.entity';
import { CompanyUserStatus, UserStatus } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
  UniqueConstraintException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { User } from '@/core/domain/user/user.entity';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { InviteTokenService } from '@/core/ports/services/invite-token.port';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidatePlanLimitsService } from './validate-plan-limits.service';

export interface AcceptInviteInput {
  companyUserId?: string;
  token?: string;
  password: string;
  phone?: string;
  document?: string;
}

export interface AcceptInviteOutput {
  companyUser: CompanyUser;
  user: User;
}

@Injectable()
export class AcceptInviteService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    @Inject('InviteTokenService')
    private readonly inviteTokenService: InviteTokenService,
    private readonly validatePlanLimitsService: ValidatePlanLimitsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: AcceptInviteInput): Promise<AcceptInviteOutput> {
    // Extract companyUserId from token if provided
    let companyUserId = input.companyUserId;

    if (input.token) {
      const tokenPayload = this.inviteTokenService.verifyInviteToken(
        input.token,
      );
      companyUserId = tokenPayload.companyUserId;
    }

    if (!companyUserId) {
      throw new DomainValidationException(
        'Nem token nem companyUserId foram fornecidos',
      );
    }

    const companyUser =
      await this.companyUserRepository.findById(companyUserId);

    if (!companyUser) {
      throw new EntityNotFoundException('Convite', companyUserId);
    }

    if (!companyUser.canAcceptInvite()) {
      if (companyUser.isActive()) {
        throw new DomainValidationException(
          ErrorMessages.COMPANY_USER.ALREADY_ACCEPTED,
        );
      }
      if (companyUser.isRejected()) {
        throw new DomainValidationException(
          ErrorMessages.COMPANY_USER.ALREADY_REJECTED,
        );
      }
      throw new DomainValidationException(
        'Este convite não pode mais ser aceito',
      );
    }

    const company = await this.companyRepository.findById(
      companyUser.companyId,
    );
    if (!company) {
      throw new EntityNotFoundException('Empresa', companyUser.companyId);
    }

    const subscription = await this.subscriptionRepository.findActiveByAdminId(
      company.adminId,
    );
    if (!subscription) {
      throw new EntityNotFoundException('Assinatura ativa', company.adminId);
    }

    const plan = await this.planRepository.findById(subscription.planId);
    if (!plan) {
      throw new EntityNotFoundException('Plano', subscription.planId);
    }

    const maxLimit = this.getMaxLimitForRole(companyUser.role, plan);
    await this.validatePlanLimitsService.validateRoleLimit(
      company.adminId,
      companyUser.role,
      maxLimit,
    );

    const user = await this.userRepository.findById(companyUser.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuário', companyUser.userId);
    }

    await this.validateUniqueConstraints(input, user.id);

    const hashedPassword = await this.passwordHasher.hash(input.password);

    const updatedUser = await this.userRepository.update(user.id, {
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      phone: input.phone ?? user.phone,
      document: input.document ?? user.document,
    } as Partial<User>);

    const updatedCompanyUser = await this.companyUserRepository.update(
      companyUser.id,
      {
        status: CompanyUserStatus.ACTIVE,
        acceptedAt: new Date(),
      } as Partial<CompanyUser>,
    );

    // Emit event for invite accepted
    this.eventEmitter.emit(
      'employee.invite.accepted',
      new EmployeeInviteAcceptedEvent(
        updatedCompanyUser.id,
        updatedCompanyUser.companyId,
        updatedUser.id,
        updatedUser.email,
        updatedCompanyUser.role,
      ),
    );

    return {
      companyUser: updatedCompanyUser,
      user: updatedUser,
    };
  }

  private getMaxLimitForRole(role: string, plan: Plan): number {
    switch (role) {
      case 'manager':
        return plan.maxManagers;
      case 'executor':
        return plan.maxExecutors;
      case 'consultant':
        return plan.maxConsultants;
      default:
        throw new DomainValidationException(
          ErrorMessages.COMPANY_USER.ROLE_REQUIRED,
        );
    }
  }

  private async validateUniqueConstraints(
    input: AcceptInviteInput,
    currentUserId: string,
  ): Promise<void> {
    if (input.phone) {
      const existingPhone = await this.userRepository.findByPhone(input.phone);
      if (existingPhone && existingPhone.id !== currentUserId) {
        throw new UniqueConstraintException('Telefone', input.phone);
      }
    }

    if (input.document) {
      const existingDocument = await this.userRepository.findByDocument(
        input.document,
      );
      if (existingDocument && existingDocument.id !== currentUserId) {
        throw new UniqueConstraintException('Documento', input.document);
      }
    }
  }
}

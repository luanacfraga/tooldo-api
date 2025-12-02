import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import {
  CompanyUserStatus,
  UserRole,
  UserStatus,
} from '@/core/domain/shared/enums';
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
import type { EmailService } from '@/core/ports/services/email-service.port';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import type { InviteTokenService } from '@/core/ports/services/invite-token.port';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
import { ValidatePlanLimitsService } from './validate-plan-limits.service';

export interface InviteEmployeeInput {
  companyId: string;
  invitedById: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  document?: string;
  role: UserRole;
  position?: string;
  notes?: string;
}

export interface InviteEmployeeOutput {
  companyUser: CompanyUser;
  user: User;
  isNewUser: boolean;
}

@Injectable()
export class InviteEmployeeService {
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
    @Inject('IdGenerator')
    private readonly idGenerator: IdGenerator,
    @Inject('PasswordHasher')
    private readonly passwordHasher: PasswordHasher,
    @Inject('EmailService')
    private readonly emailService: EmailService,
    @Inject('InviteTokenService')
    private readonly inviteTokenService: InviteTokenService,
    private readonly validatePlanLimitsService: ValidatePlanLimitsService,
  ) {}

  async execute(input: InviteEmployeeInput): Promise<InviteEmployeeOutput> {
    const company = await this.companyRepository.findById(input.companyId);
    if (!company) {
      throw new EntityNotFoundException('Empresa', input.companyId);
    }

    this.validateRole(input.role);

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

    const maxLimit = this.getMaxLimitForRole(input.role, plan);
    await this.validatePlanLimitsService.validateRoleLimit(
      company.adminId,
      input.role,
      maxLimit,
    );

    let user = await this.userRepository.findByEmail(input.email);
    let isNewUser = false;

    if (!user) {
      await this.validateUniqueConstraints(input);

      const userId = this.idGenerator.generate();
      const tempPassword = await this.passwordHasher.hash(
        this.idGenerator.generate(),
      );

      user = new User(
        userId,
        input.firstName,
        input.lastName,
        input.email,
        input.phone ?? `temp_${userId}`,
        input.document ?? `temp_${userId}`,
        'CPF' as any,
        tempPassword,
        input.role,
        UserStatus.PENDING,
        null,
      );

      user = await this.userRepository.create(user);
      isNewUser = true;
    }

    const existingCompanyUser =
      await this.companyUserRepository.findByCompanyAndUser(
        input.companyId,
        user.id,
      );

    if (existingCompanyUser) {
      if (existingCompanyUser.isRemoved()) {
        const updatedCompanyUser = await this.companyUserRepository.update(
          existingCompanyUser.id,
          {
            status: CompanyUserStatus.INVITED,
            role: input.role,
            position: input.position ?? null,
            notes: input.notes ?? null,
            invitedAt: new Date(),
            invitedBy: input.invitedById,
            acceptedAt: null,
          } as Partial<CompanyUser>,
        );

        // Generate invite token for re-invite
        const inviteToken = this.inviteTokenService.generateInviteToken({
          companyUserId: updatedCompanyUser.id,
          companyId: updatedCompanyUser.companyId,
          userId: user.id,
          email: user.email,
          role: updatedCompanyUser.role,
          document: user.document,
        });

        // Get inviter info
        const inviter = await this.userRepository.findById(input.invitedById);
        const inviterName = inviter
          ? `${inviter.firstName} ${inviter.lastName}`
          : 'Administrador';

        // Send re-invite email
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
          user,
          isNewUser,
        };
      }

      throw new DomainValidationException(
        ErrorMessages.COMPANY_USER.ALREADY_EXISTS,
      );
    }

    const companyUserId = this.idGenerator.generate();
    const companyUser = new CompanyUser(
      companyUserId,
      input.companyId,
      user.id,
      input.role,
      CompanyUserStatus.INVITED,
      input.position ?? null,
      input.notes ?? null,
      null,
      new Date(),
      input.invitedById,
      null,
    );

    const createdCompanyUser =
      await this.companyUserRepository.create(companyUser);

    // Generate invite token
    const inviteToken = this.inviteTokenService.generateInviteToken({
      companyUserId: createdCompanyUser.id,
      companyId: createdCompanyUser.companyId,
      userId: user.id,
      email: user.email,
      role: createdCompanyUser.role,
      document: user.document,
    });

    // Get inviter info
    const inviter = await this.userRepository.findById(input.invitedById);
    const inviterName = inviter
      ? `${inviter.firstName} ${inviter.lastName}`
      : 'Administrador';

    // Send invite email
    await this.emailService.sendEmployeeInvite({
      to: user.email,
      employeeName: `${user.firstName} ${user.lastName}`,
      companyName: company.name,
      inviteToken,
      inviterName,
      role: createdCompanyUser.role,
    });

    return {
      companyUser: createdCompanyUser,
      user,
      isNewUser,
    };
  }

  private validateRole(role: UserRole): void {
    const validRoles = [
      UserRole.MANAGER,
      UserRole.EXECUTOR,
      UserRole.CONSULTANT,
    ];

    if (!validRoles.includes(role)) {
      throw new DomainValidationException(
        'Apenas os cargos manager, executor e consultant são válidos para funcionários',
      );
    }
  }

  private getMaxLimitForRole(role: UserRole, plan: any): number {
    switch (role) {
      case UserRole.MANAGER:
        return plan.maxManagers;
      case UserRole.EXECUTOR:
        return plan.maxExecutors;
      case UserRole.CONSULTANT:
        return plan.maxConsultants;
      default:
        throw new DomainValidationException(
          ErrorMessages.COMPANY_USER.ROLE_REQUIRED,
        );
    }
  }

  private async validateUniqueConstraints(
    input: InviteEmployeeInput,
  ): Promise<void> {
    if (input.phone) {
      const existingPhone = await this.userRepository.findByPhone(input.phone);
      if (existingPhone) {
        throw new UniqueConstraintException('Telefone', input.phone);
      }
    }

    if (input.document) {
      const existingDocument = await this.userRepository.findByDocument(
        input.document,
      );
      if (existingDocument) {
        throw new UniqueConstraintException('Documento', input.document);
      }
    }
  }
}

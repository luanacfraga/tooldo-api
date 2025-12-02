import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { EmployeeInviteAcceptedEvent } from '@/core/domain/events/employee.events';
import { Plan } from '@/core/domain/plan/plan.entity';
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
import type { InviteTokenService } from '@/core/ports/services/invite-token.port';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidatePlanLimitsService } from './validate-plan-limits.service';

const TEMP_DOCUMENT_PREFIX = 'temp_';

export interface AcceptInviteInput {
  companyUserId?: string;
  token?: string;
  document: string;
  password: string;
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
    let tokenDocument: string | undefined;

    if (input.token) {
      const tokenPayload = this.inviteTokenService.verifyInviteToken(
        input.token,
      );
      companyUserId = tokenPayload.companyUserId;
      tokenDocument = tokenPayload.document;

      // Validate CPF early if we have token (fail fast)
      if (tokenDocument && !this.isTemporaryDocument(tokenDocument)) {
        if (input.document !== tokenDocument) {
          throw new DomainValidationException(
            ErrorMessages.COMPANY_USER.DOCUMENT_MISMATCH,
          );
        }
      }
    }

    if (!companyUserId) {
      throw new DomainValidationException(
        ErrorMessages.COMPANY_USER.TOKEN_OR_COMPANY_USER_ID_REQUIRED,
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
        ErrorMessages.COMPANY_USER.INVITE_CANNOT_BE_ACCEPTED,
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

    // Validate CPF matches the invite (from token or from user document if no token)
    this.validateDocumentMatchesInvite(
      input.document,
      tokenDocument,
      user.document,
    );

    await this.validateUniqueConstraints(input, user.id);

    const hashedPassword = await this.passwordHasher.hash(input.password);

    const updatedUser = await this.userRepository.update(user.id, {
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      document: input.document,
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

  private getMaxLimitForRole(role: UserRole, plan: Plan): number {
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

  /**
   * Validates that the provided document matches the invite document.
   * Allows document update if the invite has a temporary document.
   *
   * @param inputDocument - Document provided by user
   * @param tokenDocument - Document from invite token (if available)
   * @param userDocument - Document stored in user entity
   * @throws DomainValidationException if documents don't match
   */
  private validateDocumentMatchesInvite(
    inputDocument: string,
    tokenDocument: string | undefined,
    userDocument: string,
  ): void {
    if (tokenDocument) {
      // If we have token, validate against token document
      // Allow update if token has temporary document
      if (
        !this.isTemporaryDocument(tokenDocument) &&
        inputDocument !== tokenDocument
      ) {
        throw new DomainValidationException(
          ErrorMessages.COMPANY_USER.DOCUMENT_MISMATCH,
        );
      }
    } else {
      // If no token, validate against user document
      // Only validate if user document is not temporary
      if (
        !this.isTemporaryDocument(userDocument) &&
        inputDocument !== userDocument
      ) {
        throw new DomainValidationException(
          ErrorMessages.COMPANY_USER.DOCUMENT_MISMATCH,
        );
      }
    }
  }

  /**
   * Checks if a document is temporary (starts with temp_ prefix).
   *
   * @param document - Document to check
   * @returns true if document is temporary
   */
  private isTemporaryDocument(document: string): boolean {
    return document.startsWith(TEMP_DOCUMENT_PREFIX);
  }

  private async validateUniqueConstraints(
    input: AcceptInviteInput,
    currentUserId: string,
  ): Promise<void> {
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

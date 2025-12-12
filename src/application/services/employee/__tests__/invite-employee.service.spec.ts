import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { Company } from '@/core/domain/company/company.entity';
import { Plan } from '@/core/domain/plan/plan.entity';
import {
  CompanyUserStatus,
  UserRole,
  UserStatus,
} from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { Subscription } from '@/core/domain/subscription/subscription.entity';
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
import {
  InviteEmployeeService,
  type InviteEmployeeInput,
} from '../invite-employee.service';
import { ValidatePlanLimitsService } from '../validate-plan-limits.service';

describe('InviteEmployeeService', () => {
  let service: InviteEmployeeService;
  let userRepository: jest.Mocked<UserRepository>;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let companyUserRepository: jest.Mocked<CompanyUserRepository>;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let planRepository: jest.Mocked<PlanRepository>;
  let idGenerator: jest.Mocked<IdGenerator>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let emailService: jest.Mocked<EmailService>;
  let inviteTokenService: jest.Mocked<InviteTokenService>;
  let validatePlanLimitsService: jest.Mocked<ValidatePlanLimitsService>;

  const mockCompany = Company.create({
    id: 'company-123',
    name: 'Test Company',
    description: 'Description',
    adminId: 'admin-123',
  });

  const mockPlan = Plan.create({
    id: 'plan-123',
    name: 'Basic',
    maxCompanies: 5,
    maxManagers: 10,
    maxExecutors: 20,
    maxConsultants: 5,
    iaCallsLimit: 1000,
  });

  const mockSubscription = new Subscription(
    'sub-123',
    'admin-123',
    'plan-123',
    new Date(),
    true,
  );

  const mockInviter = new User(
    'inviter-123',
    'John',
    'Doe',
    'john@company.com',
    '11999999999',
    '12345678900',
    'CPF' as any,
    'hashed-password',
    UserRole.ADMIN,
    UserStatus.ACTIVE,
    null,
  );

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByPhone: jest.fn(),
      findByDocument: jest.fn(),
      create: jest.fn(),
    } as any;

    companyRepository = {
      findById: jest.fn(),
    } as any;

    companyUserRepository = {
      findByCompanyAndUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    subscriptionRepository = {
      findActiveByAdminId: jest.fn(),
    } as any;

    planRepository = {
      findById: jest.fn(),
    } as any;

    idGenerator = {
      generate: jest.fn(),
    } as any;

    passwordHasher = {
      hash: jest.fn(),
    } as any;

    emailService = {
      sendEmployeeInvite: jest.fn(),
    } as any;

    inviteTokenService = {
      generateInviteToken: jest.fn(),
    } as any;

    validatePlanLimitsService = {
      validateRoleLimit: jest.fn(),
    } as any;

    service = new InviteEmployeeService(
      userRepository,
      companyRepository,
      companyUserRepository,
      subscriptionRepository,
      planRepository,
      idGenerator,
      passwordHasher,
      emailService,
      inviteTokenService,
      validatePlanLimitsService,
    );
  });

  describe('execute', () => {
    const validInput: InviteEmployeeInput = {
      companyId: 'company-123',
      invitedById: 'inviter-123',
      email: 'newemployee@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.EXECUTOR,
      position: 'Developer',
    };

    it('should successfully invite a new employee', async () => {
      // Arrange
      const mockNewUser = new User(
        'user-456',
        'Jane',
        'Smith',
        'newemployee@test.com',
        'temp_user-456',
        'temp_user-456',
        'CPF' as any,
        'hashed-temp-password',
        UserRole.EXECUTOR,
        UserStatus.PENDING,
        null,
      );

      const mockCompanyUser = new CompanyUser(
        'company-user-789',
        'company-123',
        'user-456',
        UserRole.EXECUTOR,
        CompanyUserStatus.INVITED,
        'Developer',
        null,
        null,
        new Date(),
        'inviter-123',
        null,
      );

      companyRepository.findById.mockResolvedValue(mockCompany);
      subscriptionRepository.findActiveByAdminId.mockResolvedValue(
        mockSubscription,
      );
      planRepository.findById.mockResolvedValue(mockPlan);
      validatePlanLimitsService.validateRoleLimit.mockResolvedValue(undefined);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      idGenerator.generate
        .mockReturnValueOnce('user-456')
        .mockReturnValueOnce('temp-password')
        .mockReturnValueOnce('company-user-789');
      passwordHasher.hash.mockResolvedValue('hashed-temp-password');
      userRepository.create.mockResolvedValue(mockNewUser);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(null);
      companyUserRepository.create.mockResolvedValue(mockCompanyUser);
      userRepository.findById.mockResolvedValue(mockInviter);
      inviteTokenService.generateInviteToken.mockReturnValue('jwt-token-123');
      emailService.sendEmployeeInvite.mockResolvedValue(undefined);

      // Act
      const result = await service.execute(validInput);

      // Assert
      expect(result.companyUser).toEqual(mockCompanyUser);
      expect(result.user).toEqual(mockNewUser);
      expect(result.isNewUser).toBe(true);

      expect(companyRepository.findById).toHaveBeenCalledWith('company-123');
      expect(validatePlanLimitsService.validateRoleLimit).toHaveBeenCalledWith(
        'admin-123',
        UserRole.EXECUTOR,
        20,
      );
      expect(emailService.sendEmployeeInvite).toHaveBeenCalledWith({
        to: 'newemployee@test.com',
        employeeName: 'Jane Smith',
        companyName: 'Test Company',
        inviteToken: 'jwt-token-123',
        inviterName: 'John Doe',
        role: UserRole.EXECUTOR,
      });
    });

    it('should throw error when company not found', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(validInput)).rejects.toThrow(
        new EntityNotFoundException('Empresa', 'company-123'),
      );
    });

    it('should throw error when role is invalid', async () => {
      // Arrange
      const invalidInput = { ...validInput, role: UserRole.MASTER };
      companyRepository.findById.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(service.execute(invalidInput)).rejects.toThrow(
        DomainValidationException,
      );
    });

    it('should throw error when subscription not found', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      subscriptionRepository.findActiveByAdminId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(validInput)).rejects.toThrow(
        new EntityNotFoundException('Assinatura ativa', 'admin-123'),
      );
    });

    it('should throw error when plan not found', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      subscriptionRepository.findActiveByAdminId.mockResolvedValue(
        mockSubscription,
      );
      planRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(validInput)).rejects.toThrow(
        new EntityNotFoundException('Plano', 'plan-123'),
      );
    });

    it('should throw error when plan limit exceeded', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      subscriptionRepository.findActiveByAdminId.mockResolvedValue(
        mockSubscription,
      );
      planRepository.findById.mockResolvedValue(mockPlan);
      validatePlanLimitsService.validateRoleLimit.mockRejectedValue(
        new DomainValidationException(
          ErrorMessages.COMPANY_USER.MAX_EXECUTORS_EXCEEDED,
        ),
      );

      // Act & Assert
      await expect(service.execute(validInput)).rejects.toThrow(
        new DomainValidationException(
          ErrorMessages.COMPANY_USER.MAX_EXECUTORS_EXCEEDED,
        ),
      );
    });

    it('should re-invite removed employee', async () => {
      // Arrange
      const existingUser = new User(
        'user-456',
        'Jane',
        'Smith',
        'newemployee@test.com',
        '11888888888',
        '98765432100',
        'CPF' as any,
        'hashed-password',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
      );

      const removedCompanyUser = new CompanyUser(
        'company-user-789',
        'company-123',
        'user-456',
        UserRole.EXECUTOR,
        CompanyUserStatus.REMOVED,
        'Old Position',
        null,
        null,
        new Date(),
        'old-inviter',
        null,
      );

      const updatedCompanyUser = new CompanyUser(
        'company-user-789',
        'company-123',
        'user-456',
        UserRole.EXECUTOR,
        CompanyUserStatus.INVITED,
        'Developer',
        null,
        null,
        new Date(),
        'inviter-123',
        null,
      );

      companyRepository.findById.mockResolvedValue(mockCompany);
      subscriptionRepository.findActiveByAdminId.mockResolvedValue(
        mockSubscription,
      );
      planRepository.findById.mockResolvedValue(mockPlan);
      validatePlanLimitsService.validateRoleLimit.mockResolvedValue(undefined);
      userRepository.findByEmail.mockResolvedValue(existingUser);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(
        removedCompanyUser,
      );
      companyUserRepository.update.mockResolvedValue(updatedCompanyUser);
      userRepository.findById.mockResolvedValue(mockInviter);
      inviteTokenService.generateInviteToken.mockReturnValue('jwt-token-123');
      emailService.sendEmployeeInvite.mockResolvedValue(undefined);

      // Act
      const result = await service.execute(validInput);

      // Assert
      expect(result.companyUser.status).toBe(CompanyUserStatus.INVITED);
      expect(companyUserRepository.update).toHaveBeenCalled();
      expect(emailService.sendEmployeeInvite).toHaveBeenCalled();
    });

    it('should throw error when employee already exists and is active', async () => {
      // Arrange
      const existingUser = new User(
        'user-456',
        'Jane',
        'Smith',
        'newemployee@test.com',
        '11888888888',
        '98765432100',
        'CPF' as any,
        'hashed-password',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
      );

      const activeCompanyUser = new CompanyUser(
        'company-user-789',
        'company-123',
        'user-456',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Developer',
        null,
        null,
        new Date(),
        'inviter-123',
        new Date(),
      );

      companyRepository.findById.mockResolvedValue(mockCompany);
      subscriptionRepository.findActiveByAdminId.mockResolvedValue(
        mockSubscription,
      );
      planRepository.findById.mockResolvedValue(mockPlan);
      validatePlanLimitsService.validateRoleLimit.mockResolvedValue(undefined);
      userRepository.findByEmail.mockResolvedValue(existingUser);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(
        activeCompanyUser,
      );

      // Act & Assert
      await expect(service.execute(validInput)).rejects.toThrow(
        new DomainValidationException(
          ErrorMessages.COMPANY_USER.ALREADY_EXISTS,
        ),
      );
    });
  });
});

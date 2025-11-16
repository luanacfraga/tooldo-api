/* eslint-disable @typescript-eslint/unbound-method */
import { SubscriptionFactory } from '@/application/factories/subscription.factory';
import { UserFactory } from '@/application/factories/user.factory';
import { Company } from '@/core/domain/company/company.entity';
import { DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';
import {
  EntityNotFoundException,
  UniqueConstraintException,
} from '@/core/domain/shared/exceptions/domain.exception';
import { Plan } from '@/core/domain/plan/plan.entity';
import { Subscription } from '@/core/domain/subscription/subscription.entity';
import { User } from '@/core/domain/user/user.entity';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { Test, TestingModule } from '@nestjs/testing';
import {
  RegisterAdminInput,
  RegisterAdminService,
} from './register-admin.service';

describe('RegisterAdminService', () => {
  let service: RegisterAdminService;
  let userRepository: jest.Mocked<UserRepository>;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let planRepository: jest.Mocked<PlanRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let idGenerator: jest.Mocked<IdGenerator>;
  let transactionManager: jest.Mocked<TransactionManager>;
  let userFactory: UserFactory;
  let subscriptionFactory: SubscriptionFactory;

  const mockUserId = 'user-id-123';
  const mockCompanyId = 'company-id-123';
  const mockSubscriptionId = 'subscription-id-123';
  const mockPlanId = 'plan-id-123';
  const mockHashedPassword = 'hashed_password_123';

  const mockInput: RegisterAdminInput = {
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@example.com',
    password: 'password123',
    phone: '11987654321',
    document: '12345678900',
    documentType: DocumentType.CPF,
    company: {
      name: 'Empresa Teste',
      description: 'Descrição da empresa',
    },
  };

  const mockDefaultPlan = new Plan(
    mockPlanId,
    'default',
    10,
    50,
    100,
    30,
    1000,
  );

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByDocument: jest.fn(),
      create: jest.fn(),
    };

    const mockCompanyRepository = {
      create: jest.fn(),
    };

    const mockSubscriptionRepository = {
      create: jest.fn(),
    };

    const mockPlanRepository = {
      findByName: jest.fn(),
      create: jest.fn(),
    };

    const mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockIdGenerator = {
      generate: jest.fn(),
    };

    const mockTransactionManager = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterAdminService,
        UserFactory,
        SubscriptionFactory,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'CompanyRepository',
          useValue: mockCompanyRepository,
        },
        {
          provide: 'SubscriptionRepository',
          useValue: mockSubscriptionRepository,
        },
        {
          provide: 'PlanRepository',
          useValue: mockPlanRepository,
        },
        {
          provide: 'PasswordHasher',
          useValue: mockPasswordHasher,
        },
        {
          provide: 'IdGenerator',
          useValue: mockIdGenerator,
        },
        {
          provide: 'TransactionManager',
          useValue: mockTransactionManager,
        },
      ],
    }).compile();

    service = module.get<RegisterAdminService>(RegisterAdminService);
    userRepository = module.get('UserRepository');
    companyRepository = module.get('CompanyRepository');
    subscriptionRepository = module.get('SubscriptionRepository');
    planRepository = module.get('PlanRepository');
    passwordHasher = module.get('PasswordHasher');
    idGenerator = module.get('IdGenerator');
    transactionManager = module.get('TransactionManager');
    userFactory = module.get<UserFactory>(UserFactory);
    subscriptionFactory = module.get<SubscriptionFactory>(SubscriptionFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should register admin successfully', async () => {
      // Arrange
      const mockUser = new User(
        mockUserId,
        mockInput.firstName,
        mockInput.lastName,
        mockInput.email,
        mockInput.phone,
        mockInput.document,
        mockInput.documentType,
        mockHashedPassword,
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );
      const mockCompany = new Company(
        mockCompanyId,
        mockInput.company.name,
        mockInput.company.description ?? null,
        mockUserId,
      );
      const mockSubscription = new Subscription(
        mockSubscriptionId,
        mockUserId,
        mockPlanId,
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(mockDefaultPlan);
      idGenerator.generate
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockCompanyId)
        .mockReturnValueOnce(mockSubscriptionId);
      passwordHasher.hash.mockResolvedValue(mockHashedPassword);
      transactionManager.execute.mockImplementation(async (fn) => {
        const tx = {};
        return await fn(tx);
      });
      userRepository.create.mockResolvedValue(mockUser);
      companyRepository.create.mockResolvedValue(mockCompany);
      subscriptionRepository.create.mockResolvedValue(mockSubscription);

      // Act
      const result = await service.execute(mockInput);

      // Assert
      expect(result).toEqual({
        user: mockUser,
        company: mockCompany,
        subscription: mockSubscription,
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(mockInput.phone);
      expect(userRepository.findByDocument).toHaveBeenCalledWith(
        mockInput.document,
      );
      expect(planRepository.findByName).toHaveBeenCalledWith('default');
      expect(idGenerator.generate).toHaveBeenCalledTimes(3);
      expect(passwordHasher.hash).toHaveBeenCalledWith(mockInput.password);
      expect(transactionManager.execute).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.any(User),
        expect.anything(),
      );
      expect(companyRepository.create).toHaveBeenCalledWith(
        expect.any(Company),
        expect.anything(),
      );
      expect(subscriptionRepository.create).toHaveBeenCalledWith(
        expect.any(Subscription),
        expect.anything(),
      );
    });

    it('should create user with correct properties', async () => {
      // Arrange
      const mockUser = new User(
        mockUserId,
        mockInput.firstName,
        mockInput.lastName,
        mockInput.email,
        mockInput.phone,
        mockInput.document,
        mockInput.documentType,
        mockHashedPassword,
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );
      const mockCompany = new Company(
        mockCompanyId,
        mockInput.company.name,
        mockInput.company.description ?? null,
        mockUserId,
      );
      const mockSubscription = new Subscription(
        mockSubscriptionId,
        mockUserId,
        mockPlanId,
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(mockDefaultPlan);
      idGenerator.generate
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockCompanyId)
        .mockReturnValueOnce(mockSubscriptionId);
      passwordHasher.hash.mockResolvedValue(mockHashedPassword);
      transactionManager.execute.mockImplementation(async (fn) => {
        const tx = {};
        return await fn(tx);
      });
      userRepository.create.mockResolvedValue(mockUser);
      companyRepository.create.mockResolvedValue(mockCompany);
      subscriptionRepository.create.mockResolvedValue(mockSubscription);

      // Act
      await service.execute(mockInput);

      // Assert
      const createdUser = userRepository.create.mock.calls[0][0];
      expect(createdUser).toBeInstanceOf(User);
      expect(createdUser.id).toBe(mockUserId);
      expect(createdUser.firstName).toBe(mockInput.firstName);
      expect(createdUser.lastName).toBe(mockInput.lastName);
      expect(createdUser.email).toBe(mockInput.email);
      expect(createdUser.phone).toBe(mockInput.phone);
      expect(createdUser.document).toBe(mockInput.document);
      expect(createdUser.documentType).toBe(mockInput.documentType);
      expect(createdUser.password).toBe(mockHashedPassword);
      expect(createdUser.role).toBe(UserRole.ADMIN);
      expect(createdUser.status).toBe(UserStatus.ACTIVE);
      expect(createdUser.profileImageUrl).toBeNull();
    });

    it('should create company with correct properties', async () => {
      // Arrange
      const mockUser = new User(
        mockUserId,
        mockInput.firstName,
        mockInput.lastName,
        mockInput.email,
        mockInput.phone,
        mockInput.document,
        mockInput.documentType,
        mockHashedPassword,
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );
      const mockCompany = new Company(
        mockCompanyId,
        mockInput.company.name,
        mockInput.company.description ?? null,
        mockUserId,
      );
      const mockSubscription = new Subscription(
        mockSubscriptionId,
        mockUserId,
        mockPlanId,
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(mockDefaultPlan);
      idGenerator.generate
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockCompanyId)
        .mockReturnValueOnce(mockSubscriptionId);
      passwordHasher.hash.mockResolvedValue(mockHashedPassword);
      transactionManager.execute.mockImplementation(async (fn) => {
        const tx = {};
        return await fn(tx);
      });
      userRepository.create.mockResolvedValue(mockUser);
      companyRepository.create.mockResolvedValue(mockCompany);
      subscriptionRepository.create.mockResolvedValue(mockSubscription);

      // Act
      await service.execute(mockInput);

      // Assert
      const createdCompany = companyRepository.create.mock.calls[0][0];
      expect(createdCompany).toBeInstanceOf(Company);
      expect(createdCompany.id).toBe(mockCompanyId);
      expect(createdCompany.name).toBe(mockInput.company.name);
      expect(createdCompany.description).toBe(mockInput.company.description);
      expect(createdCompany.adminId).toBe(mockUserId);
    });

    it('should create company with null description when not provided', async () => {
      // Arrange
      const inputWithoutDescription: RegisterAdminInput = {
        ...mockInput,
        company: {
          name: 'Empresa Teste',
        },
      };
      const mockUser = new User(
        mockUserId,
        inputWithoutDescription.firstName,
        inputWithoutDescription.lastName,
        inputWithoutDescription.email,
        inputWithoutDescription.phone,
        inputWithoutDescription.document,
        inputWithoutDescription.documentType,
        mockHashedPassword,
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );
      const mockCompany = new Company(
        mockCompanyId,
        inputWithoutDescription.company.name,
        null,
        mockUserId,
      );
      const mockSubscription = new Subscription(
        mockSubscriptionId,
        mockUserId,
        mockPlanId,
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(mockDefaultPlan);
      idGenerator.generate
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockCompanyId)
        .mockReturnValueOnce(mockSubscriptionId);
      passwordHasher.hash.mockResolvedValue(mockHashedPassword);
      transactionManager.execute.mockImplementation(async (fn) => {
        const tx = {};
        return await fn(tx);
      });
      userRepository.create.mockResolvedValue(mockUser);
      companyRepository.create.mockResolvedValue(mockCompany);
      subscriptionRepository.create.mockResolvedValue(mockSubscription);

      // Act
      await service.execute(inputWithoutDescription);

      // Assert
      const createdCompany = companyRepository.create.mock.calls[0][0];
      expect(createdCompany.description).toBeNull();
    });

    it('should create subscription with correct properties', async () => {
      // Arrange
      const mockUser = new User(
        mockUserId,
        mockInput.firstName,
        mockInput.lastName,
        mockInput.email,
        mockInput.phone,
        mockInput.document,
        mockInput.documentType,
        mockHashedPassword,
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );
      const mockCompany = new Company(
        mockCompanyId,
        mockInput.company.name,
        mockInput.company.description ?? null,
        mockUserId,
      );
      const mockSubscription = new Subscription(
        mockSubscriptionId,
        mockUserId,
        mockPlanId,
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(mockDefaultPlan);
      idGenerator.generate
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockCompanyId)
        .mockReturnValueOnce(mockSubscriptionId);
      passwordHasher.hash.mockResolvedValue(mockHashedPassword);
      transactionManager.execute.mockImplementation(async (fn) => {
        const tx = {};
        return await fn(tx);
      });
      userRepository.create.mockResolvedValue(mockUser);
      companyRepository.create.mockResolvedValue(mockCompany);
      subscriptionRepository.create.mockResolvedValue(mockSubscription);

      // Act
      await service.execute(mockInput);

      // Assert
      const createdSubscription = subscriptionRepository.create.mock.calls[0][0];
      expect(createdSubscription).toBeInstanceOf(Subscription);
      expect(createdSubscription.id).toBe(mockSubscriptionId);
      expect(createdSubscription.adminId).toBe(mockUserId);
      expect(createdSubscription.planId).toBe(mockPlanId);
      expect(createdSubscription.isActive).toBe(true);
      expect(createdSubscription.startedAt).toBeInstanceOf(Date);
    });

    it('should throw UniqueConstraintException when email already exists', async () => {
      // Arrange
      const existingUser = new User(
        'existing-id',
        'Existing',
        'User',
        mockInput.email,
        '11999999999',
        '99999999999',
        DocumentType.CPF,
        'hashed',
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );

      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.execute(mockInput)).rejects.toThrow(
        UniqueConstraintException,
      );
      await expect(service.execute(mockInput)).rejects.toThrow('Email');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(userRepository.findByPhone).not.toHaveBeenCalled();
      expect(userRepository.findByDocument).not.toHaveBeenCalled();
    });

    it('should throw UniqueConstraintException when phone already exists', async () => {
      // Arrange
      const existingUser = new User(
        'existing-id',
        'Existing',
        'User',
        'other@example.com',
        mockInput.phone,
        '99999999999',
        DocumentType.CPF,
        'hashed',
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.execute(mockInput)).rejects.toThrow(
        UniqueConstraintException,
      );
      await expect(service.execute(mockInput)).rejects.toThrow('Telefone');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(mockInput.phone);
      expect(userRepository.findByDocument).not.toHaveBeenCalled();
    });

    it('should throw UniqueConstraintException when document already exists', async () => {
      // Arrange
      const existingUser = new User(
        'existing-id',
        'Existing',
        'User',
        'other@example.com',
        '11999999999',
        mockInput.document,
        DocumentType.CPF,
        'hashed',
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.execute(mockInput)).rejects.toThrow(
        UniqueConstraintException,
      );
      await expect(service.execute(mockInput)).rejects.toThrow('Documento');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockInput.email);
      expect(userRepository.findByPhone).toHaveBeenCalledWith(mockInput.phone);
      expect(userRepository.findByDocument).toHaveBeenCalledWith(
        mockInput.document,
      );
    });

    it('should throw EntityNotFoundException when default plan does not exist', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(null);

      // Act & Assert
      await expect(service.execute(mockInput)).rejects.toThrow(
        EntityNotFoundException,
      );
      await expect(service.execute(mockInput)).rejects.toThrow('Plano padrão');
      expect(planRepository.findByName).toHaveBeenCalledWith('default');
    });

    it('should hash password before creating user', async () => {
      // Arrange
      const mockUser = new User(
        mockUserId,
        mockInput.firstName,
        mockInput.lastName,
        mockInput.email,
        mockInput.phone,
        mockInput.document,
        mockInput.documentType,
        mockHashedPassword,
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );
      const mockCompany = new Company(
        mockCompanyId,
        mockInput.company.name,
        mockInput.company.description ?? null,
        mockUserId,
      );
      const mockSubscription = new Subscription(
        mockSubscriptionId,
        mockUserId,
        mockPlanId,
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(mockDefaultPlan);
      idGenerator.generate
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockCompanyId)
        .mockReturnValueOnce(mockSubscriptionId);
      passwordHasher.hash.mockResolvedValue(mockHashedPassword);
      transactionManager.execute.mockImplementation(async (fn) => {
        const tx = {};
        return await fn(tx);
      });
      userRepository.create.mockResolvedValue(mockUser);
      companyRepository.create.mockResolvedValue(mockCompany);
      subscriptionRepository.create.mockResolvedValue(mockSubscription);

      // Act
      await service.execute(mockInput);

      // Assert
      expect(passwordHasher.hash).toHaveBeenCalledWith(mockInput.password);
      expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
      const createdUser = userRepository.create.mock.calls[0][0];
      expect(createdUser.password).toBe(mockHashedPassword);
    });

    it('should execute all operations within a transaction', async () => {
      // Arrange
      const mockUser = new User(
        mockUserId,
        mockInput.firstName,
        mockInput.lastName,
        mockInput.email,
        mockInput.phone,
        mockInput.document,
        mockInput.documentType,
        mockHashedPassword,
        UserRole.ADMIN,
        UserStatus.ACTIVE,
        null,
      );
      const mockCompany = new Company(
        mockCompanyId,
        mockInput.company.name,
        mockInput.company.description ?? null,
        mockUserId,
      );
      const mockSubscription = new Subscription(
        mockSubscriptionId,
        mockUserId,
        mockPlanId,
        new Date(),
        true,
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByPhone.mockResolvedValue(null);
      userRepository.findByDocument.mockResolvedValue(null);
      planRepository.findByName.mockResolvedValue(mockDefaultPlan);
      idGenerator.generate
        .mockReturnValueOnce(mockUserId)
        .mockReturnValueOnce(mockCompanyId)
        .mockReturnValueOnce(mockSubscriptionId);
      passwordHasher.hash.mockResolvedValue(mockHashedPassword);

      const mockTx = { transactionId: 'tx-123' };
      transactionManager.execute.mockImplementation(async (fn) => {
        return await fn(mockTx);
      });

      userRepository.create.mockResolvedValue(mockUser);
      companyRepository.create.mockResolvedValue(mockCompany);
      subscriptionRepository.create.mockResolvedValue(mockSubscription);

      // Act
      await service.execute(mockInput);

      // Assert
      expect(transactionManager.execute).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.any(User),
        mockTx,
      );
      expect(companyRepository.create).toHaveBeenCalledWith(
        expect.any(Company),
        mockTx,
      );
      expect(subscriptionRepository.create).toHaveBeenCalledWith(
        expect.any(Subscription),
        mockTx,
      );
    });
  });
});


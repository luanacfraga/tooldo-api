/* eslint-disable @typescript-eslint/unbound-method */
import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';
import { AuthenticationException } from '@/core/domain/shared/exceptions/domain.exception';
import { User } from '@/core/domain/user/user.entity';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, type LoginInput } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let companyUserRepository: jest.Mocked<CompanyUserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'Test',
    'User',
    'test@example.com',
    '11987654321',
    '12345678900',
    DocumentType.CPF,
    'hashed_password_123',
    UserRole.ADMIN,
    UserStatus.ACTIVE,
    null,
  );

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    const mockCompanyUserRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByCompanyId: jest.fn(),
      findByCompanyAndUser: jest.fn(),
      findByCompanyIdAndStatus: jest.fn(),
      findByCompanyIdPaginated: jest.fn(),
      countByAdminIdAndRole: jest.fn(),
      countByAdminIdRoleAndStatus: jest.fn(),
    };

    const mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'CompanyUserRepository',
          useValue: mockCompanyUserRepository,
        },
        {
          provide: 'PasswordHasher',
          useValue: mockPasswordHasher,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get('UserRepository');
    companyUserRepository = module.get('CompanyUserRepository');
    passwordHasher = module.get('PasswordHasher');
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginInput: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const expectedToken = 'jwt_token_123';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      // Admin não precisa verificar CompanyUser
      jwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.login(loginInput);

      expect(result).toEqual({
        access_token: expectedToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(passwordHasher.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      // Admin não verifica CompanyUser
      expect(companyUserRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationException when user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginInput)).rejects.toThrow(
        AuthenticationException,
      );
      await expect(service.login(loginInput)).rejects.toThrow(
        'Credenciais inválidas',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationException when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(false);

      await expect(service.login(loginInput)).rejects.toThrow(
        AuthenticationException,
      );
      await expect(service.login(loginInput)).rejects.toThrow(
        'Credenciais inválidas',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(passwordHasher.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should return correct JWT payload structure', async () => {
      const expectedToken = 'jwt_token_xyz';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      await service.login(loginInput);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        }),
      );
    });

    it('should allow login for non-admin user with active company', async () => {
      const executorUser = new User(
        'executor-id',
        'Executor',
        'User',
        'executor@example.com',
        '11987654321',
        '12345678900',
        DocumentType.CPF,
        'hashed_password_123',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
      );

      const activeCompanyUser = new CompanyUser(
        'cu-1',
        'company-1',
        'executor-id',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
      );

      const expectedToken = 'jwt_token_executor';
      userRepository.findByEmail.mockResolvedValue(executorUser);
      passwordHasher.compare.mockResolvedValue(true);
      companyUserRepository.findByUserId.mockResolvedValue([activeCompanyUser]);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.login(loginInput);

      expect(result.access_token).toBe(expectedToken);
      expect(companyUserRepository.findByUserId).toHaveBeenCalledWith('executor-id');
    });

    it('should throw AuthenticationException for non-admin user suspended in all companies', async () => {
      const executorUser = new User(
        'executor-id',
        'Executor',
        'User',
        'executor@example.com',
        '11987654321',
        '12345678900',
        DocumentType.CPF,
        'hashed_password_123',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
      );

      const suspendedCompanyUser = new CompanyUser(
        'cu-1',
        'company-1',
        'executor-id',
        UserRole.EXECUTOR,
        CompanyUserStatus.SUSPENDED,
      );

      userRepository.findByEmail.mockResolvedValue(executorUser);
      passwordHasher.compare.mockResolvedValue(true);
      companyUserRepository.findByUserId.mockResolvedValue([suspendedCompanyUser]);

      await expect(service.login(loginInput)).rejects.toThrow(
        AuthenticationException,
      );
      await expect(service.login(loginInput)).rejects.toThrow(
        'Sua conta está suspensa. Entre em contato com o administrador.',
      );
      expect(companyUserRepository.findByUserId).toHaveBeenCalledWith('executor-id');
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should allow login for non-admin user without companies', async () => {
      const executorUser = new User(
        'executor-id',
        'Executor',
        'User',
        'executor@example.com',
        '11987654321',
        '12345678900',
        DocumentType.CPF,
        'hashed_password_123',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
      );

      const expectedToken = 'jwt_token_executor';
      userRepository.findByEmail.mockResolvedValue(executorUser);
      passwordHasher.compare.mockResolvedValue(true);
      companyUserRepository.findByUserId.mockResolvedValue([]);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.login(loginInput);

      expect(result.access_token).toBe(expectedToken);
      expect(companyUserRepository.findByUserId).toHaveBeenCalledWith('executor-id');
    });
  });
});

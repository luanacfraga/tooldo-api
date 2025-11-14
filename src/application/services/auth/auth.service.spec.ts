/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';
import { User } from '@/core/domain/user/user.entity';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { PasswordHasher } from '@/core/ports/services/password-hasher.port';
import { AuthService, type LoginInput } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
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
      // Arrange
      const expectedToken = 'jwt_token_123';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.login(loginInput);

      // Assert
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
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginInput)).rejects.toThrow(
        'Credenciais inválidas',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(passwordHasher.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
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
      // Arrange
      const expectedToken = 'jwt_token_xyz';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      await service.login(loginInput);

      // Assert
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        }),
      );
    });
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { AVATAR_COLORS } from '@/shared/constants/avatar-colors';
import { User } from '@/core/domain/user/user.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserAvatarColorService } from './update-user-avatar-color.service';
import { DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';

describe('UpdateUserAvatarColorService', () => {
  let service: UpdateUserAvatarColorService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUser = new User(
    mockUserId,
    'John',
    'Doe',
    'john@example.com',
    '+5511999999999',
    '12345678900',
    DocumentType.CPF,
    'hashedPassword',
    UserRole.EXECUTOR,
    UserStatus.ACTIVE,
    null,
    '#3B82F6',
    'JD',
  );

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByDocument: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserAvatarColorService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UpdateUserAvatarColorService>(
      UpdateUserAvatarColorService,
    );
    userRepository = module.get('UserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should update user avatar color successfully', async () => {
      const newColor = '#10B981';
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockImplementation((user: User) =>
        Promise.resolve(user),
      );

      const result = await service.execute({
        userId: mockUserId,
        avatarColor: newColor,
      });

      expect(result).toBeInstanceOf(User);
      expect(result.avatarColor).toBe(newColor);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).toHaveBeenCalledTimes(1);
      const updateCall = userRepository.update.mock.calls[0][0];
      expect(updateCall).toBeInstanceOf(User);
      expect(updateCall.avatarColor).toBe(newColor);
    });

    it('should throw EntityNotFoundException when user does not exist', async () => {
      const newColor = '#10B981';
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute({
          userId: mockUserId,
          avatarColor: newColor,
        }),
      ).rejects.toThrow(EntityNotFoundException);
      await expect(
        service.execute({
          userId: mockUserId,
          avatarColor: newColor,
        }),
      ).rejects.toThrow(
        `Usuário com identificador '${mockUserId}' não foi encontrado(a)`,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should update to each of the predefined colors', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockImplementation((user: User) =>
        Promise.resolve(user),
      );

      for (const color of AVATAR_COLORS) {
        const result = await service.execute({
          userId: mockUserId,
          avatarColor: color,
        });

        expect(result.avatarColor).toBe(color);
      }

      expect(userRepository.update).toHaveBeenCalledTimes(AVATAR_COLORS.length);
    });

    it('should preserve other user properties when updating color', async () => {
      const newColor = '#EF4444';
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockImplementation((user: User) =>
        Promise.resolve(user),
      );

      const result = await service.execute({
        userId: mockUserId,
        avatarColor: newColor,
      });

      expect(result.id).toBe(mockUser.id);
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.email).toBe(mockUser.email);
      expect(result.phone).toBe(mockUser.phone);
      expect(result.document).toBe(mockUser.document);
      expect(result.initials).toBe(mockUser.initials);
      expect(result.avatarColor).toBe(newColor);
    });
  });
});

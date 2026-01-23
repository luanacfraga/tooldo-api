/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { Action } from '@/core/domain/action';
import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { User } from '@/core/domain/user/user.entity';
import {
  ActionPriority,
  ActionStatus,
  CompanyUserStatus,
  DocumentType,
  UserRole,
  UserStatus,
} from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import type { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import type { TransactionManager } from '@/core/ports/services/transaction-manager.port';
import { RemoveEmployeeWithTransferService } from '../remove-employee-with-transfer.service';

describe('RemoveEmployeeWithTransferService', () => {
  let service: RemoveEmployeeWithTransferService;
  let transactionManager: jest.Mocked<TransactionManager>;
  let actionRepository: jest.Mocked<ActionRepository>;
  let actionMovementRepository: jest.Mocked<ActionMovementRepository>;
  let companyUserRepository: jest.Mocked<CompanyUserRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    transactionManager = {
      execute: jest.fn(),
    } as any;

    actionRepository = {
      findByResponsibleId: jest.fn(),
      update: jest.fn(),
    } as any;

    actionMovementRepository = {
      create: jest.fn(),
    } as any;

    companyUserRepository = {
      findById: jest.fn(),
      findByCompanyAndUser: jest.fn(),
      update: jest.fn(),
    } as any;

    userRepository = {
      findById: jest.fn(),
    } as any;

    service = new RemoveEmployeeWithTransferService(
      transactionManager,
      actionRepository,
      actionMovementRepository,
      companyUserRepository,
      userRepository,
    );
  });

  describe('execute', () => {
    it('should successfully transfer actions and remove employee', async () => {
      // Arrange
      const employeeToRemove = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      const newResponsibleCompanyUser = new CompanyUser(
        'cu-456',
        'company-123',
        'user-456',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Senior Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      const employeeUser = new User(
        'user-123',
        'João',
        'Silva',
        'joao@example.com',
        '11999999999',
        '12345678900',
        DocumentType.CPF,
        '$2b$10$hashedpasswordexample123456789',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
        null,
        null,
        null,
        null,
      );

      const newResponsibleUser = new User(
        'user-456',
        'Maria',
        'Santos',
        'maria@example.com',
        '11888888888',
        '98765432100',
        DocumentType.CPF,
        '$2b$10$hashedpasswordexample123456789',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
        null,
        null,
        null,
        null,
      );

      const pendingAction1 = new Action(
        'action-1',
        'root cause 1',
        'Tarefa 1',
        'Descrição 1',
        ActionStatus.TODO,
        ActionPriority.MEDIUM,
        new Date(),
        new Date(),
        null,
        null,
        false,
        false,
        null,
        'company-123',
        'team-123',
        'user-123',
        'user-123',
        null,
      );

      const pendingAction2 = new Action(
        'action-2',
        'root cause 2',
        'Tarefa 2',
        'Descrição 2',
        ActionStatus.IN_PROGRESS,
        ActionPriority.HIGH,
        new Date(),
        new Date(),
        new Date(),
        null,
        false,
        false,
        null,
        'company-123',
        'team-123',
        'user-123',
        'user-123',
        null,
      );

      companyUserRepository.findById.mockResolvedValue(employeeToRemove);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(
        newResponsibleCompanyUser,
      );
      userRepository.findById
        .mockResolvedValueOnce(employeeUser)
        .mockResolvedValueOnce(newResponsibleUser);

      transactionManager.execute.mockImplementation(async (fn) => {
        actionRepository.findByResponsibleId.mockResolvedValue([
          pendingAction1,
          pendingAction2,
        ]);
        actionRepository.update.mockResolvedValue({} as any);
        actionMovementRepository.create.mockResolvedValue({} as any);
        companyUserRepository.update.mockResolvedValue({} as any);

        const mockTx = {
          team: {
            findMany: jest.fn().mockResolvedValue([{ id: 'team-1' }]),
          },
          teamUser: {
            deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        };

        return await fn(mockTx);
      });

      // Act
      const result = await service.execute({
        companyUserId: 'cu-123',
        newResponsibleId: 'user-456',
        currentUserId: 'admin-123',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.summary.actionsTransferred).toBe(2);
      expect(result.summary.teamsRemovedFrom).toBe(1);
      expect(result.summary.employeeRemoved.id).toBe('user-123');
      expect(result.summary.employeeRemoved.name).toBe('João Silva');
      expect(result.summary.newResponsible.id).toBe('user-456');
      expect(result.summary.newResponsible.name).toBe('Maria Santos');
      expect(result.summary.actionDetails).toHaveLength(2);
    });

    it('should successfully remove employee with no pending actions', async () => {
      // Arrange
      const employeeToRemove = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      const newResponsibleCompanyUser = new CompanyUser(
        'cu-456',
        'company-123',
        'user-456',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Senior Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      const employeeUser = new User(
        'user-123',
        'João',
        'Silva',
        'joao@example.com',
        '11999999999',
        '12345678900',
        DocumentType.CPF,
        '$2b$10$hashedpasswordexample123456789',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
        null,
        null,
        null,
        null,
      );

      const newResponsibleUser = new User(
        'user-456',
        'Maria',
        'Santos',
        'maria@example.com',
        '11888888888',
        '98765432100',
        DocumentType.CPF,
        '$2b$10$hashedpasswordexample123456789',
        UserRole.EXECUTOR,
        UserStatus.ACTIVE,
        null,
        null,
        null,
        null,
        null,
      );

      companyUserRepository.findById.mockResolvedValue(employeeToRemove);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(
        newResponsibleCompanyUser,
      );
      userRepository.findById
        .mockResolvedValueOnce(employeeUser)
        .mockResolvedValueOnce(newResponsibleUser);

      transactionManager.execute.mockImplementation(async (fn) => {
        actionRepository.findByResponsibleId.mockResolvedValue([]);

        const mockTx = {
          team: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          teamUser: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
        };

        return await fn(mockTx);
      });

      // Act
      const result = await service.execute({
        companyUserId: 'cu-123',
        newResponsibleId: 'user-456',
        currentUserId: 'admin-123',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.summary.actionsTransferred).toBe(0);
      expect(result.summary.actionDetails).toHaveLength(0);
    });

    it('should throw error when employee not found', async () => {
      // Arrange
      companyUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.execute({
          companyUserId: 'cu-123',
          newResponsibleId: 'user-456',
          currentUserId: 'admin-123',
        }),
      ).rejects.toThrow(new EntityNotFoundException('Funcionário', 'cu-123'));
    });

    it('should throw error when trying to remove invited employee', async () => {
      // Arrange
      const invitedEmployee = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.INVITED,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        null,
      );

      companyUserRepository.findById.mockResolvedValue(invitedEmployee);

      // Act & Assert
      await expect(
        service.execute({
          companyUserId: 'cu-123',
          newResponsibleId: 'user-456',
          currentUserId: 'admin-123',
        }),
      ).rejects.toThrow(DomainValidationException);
    });

    it('should throw error when employee cannot be removed', async () => {
      // Arrange
      const removedEmployee = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.REMOVED,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      companyUserRepository.findById.mockResolvedValue(removedEmployee);

      // Act & Assert
      await expect(
        service.execute({
          companyUserId: 'cu-123',
          newResponsibleId: 'user-456',
          currentUserId: 'admin-123',
        }),
      ).rejects.toThrow(DomainValidationException);
    });

    it('should throw error when new responsible not found', async () => {
      // Arrange
      const employeeToRemove = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      companyUserRepository.findById.mockResolvedValue(employeeToRemove);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.execute({
          companyUserId: 'cu-123',
          newResponsibleId: 'user-456',
          currentUserId: 'admin-123',
        }),
      ).rejects.toThrow(
        new EntityNotFoundException('Novo responsável', 'user-456'),
      );
    });

    it('should throw error when new responsible is not active', async () => {
      // Arrange
      const employeeToRemove = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      const suspendedResponsible = new CompanyUser(
        'cu-456',
        'company-123',
        'user-456',
        UserRole.EXECUTOR,
        CompanyUserStatus.SUSPENDED,
        'Senior Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      companyUserRepository.findById.mockResolvedValue(employeeToRemove);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(
        suspendedResponsible,
      );

      // Act & Assert
      await expect(
        service.execute({
          companyUserId: 'cu-123',
          newResponsibleId: 'user-456',
          currentUserId: 'admin-123',
        }),
      ).rejects.toThrow(DomainValidationException);
    });

    it('should throw error when new responsible is the same as employee being removed', async () => {
      // Arrange
      const employeeToRemove = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      const sameEmployee = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.ACTIVE,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

      companyUserRepository.findById.mockResolvedValue(employeeToRemove);
      companyUserRepository.findByCompanyAndUser.mockResolvedValue(
        sameEmployee,
      );

      // Act & Assert
      await expect(
        service.execute({
          companyUserId: 'cu-123',
          newResponsibleId: 'user-123',
          currentUserId: 'admin-123',
        }),
      ).rejects.toThrow(DomainValidationException);
    });
  });
});

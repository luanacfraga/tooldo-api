/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { RemoveEmployeeService } from '../remove-employee.service';

describe('RemoveEmployeeService', () => {
  let service: RemoveEmployeeService;
  let companyUserRepository: jest.Mocked<CompanyUserRepository>;

  beforeEach(() => {
    companyUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    service = new RemoveEmployeeService(companyUserRepository);
  });

  describe('execute', () => {
    it('should successfully remove an active employee', async () => {
      // Arrange
      const activeEmployee = new CompanyUser(
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

      companyUserRepository.findById.mockResolvedValue(activeEmployee);
      companyUserRepository.update.mockResolvedValue(removedEmployee);

      // Act
      const result = await service.execute({ companyUserId: 'cu-123' });

      // Assert
      expect(result.companyUser.status).toBe(CompanyUserStatus.REMOVED);
      expect(companyUserRepository.update).toHaveBeenCalledWith('cu-123', {
        status: CompanyUserStatus.REMOVED,
      });
    });

    it('should successfully remove a suspended employee', async () => {
      // Arrange
      const suspendedEmployee = new CompanyUser(
        'cu-123',
        'company-123',
        'user-123',
        UserRole.EXECUTOR,
        CompanyUserStatus.SUSPENDED,
        'Developer',
        null,
        null,
        new Date(),
        'admin-123',
        new Date(),
      );

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

      companyUserRepository.findById.mockResolvedValue(suspendedEmployee);
      companyUserRepository.update.mockResolvedValue(removedEmployee);

      // Act
      const result = await service.execute({ companyUserId: 'cu-123' });

      // Assert
      expect(result.companyUser.status).toBe(CompanyUserStatus.REMOVED);
    });

    it('should throw error when employee not found', async () => {
      // Arrange
      companyUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.execute({ companyUserId: 'cu-123' }),
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
        service.execute({ companyUserId: 'cu-123' }),
      ).rejects.toThrow(DomainValidationException);
    });

    it('should throw error when trying to remove already removed employee', async () => {
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
        service.execute({ companyUserId: 'cu-123' }),
      ).rejects.toThrow(DomainValidationException);
    });
  });
});

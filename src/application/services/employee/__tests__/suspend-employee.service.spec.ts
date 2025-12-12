import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { SuspendEmployeeService } from '../suspend-employee.service';

describe('SuspendEmployeeService', () => {
  let service: SuspendEmployeeService;
  let companyUserRepository: jest.Mocked<CompanyUserRepository>;

  beforeEach(() => {
    companyUserRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    service = new SuspendEmployeeService(companyUserRepository);
  });

  describe('execute', () => {
    it('should successfully suspend an active employee', async () => {
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

      companyUserRepository.findById.mockResolvedValue(activeEmployee);
      companyUserRepository.update.mockResolvedValue(suspendedEmployee);

      // Act
      const result = await service.execute({ companyUserId: 'cu-123' });

      // Assert
      expect(result.companyUser.status).toBe(CompanyUserStatus.SUSPENDED);
      expect(companyUserRepository.update).toHaveBeenCalledWith('cu-123', {
        status: CompanyUserStatus.SUSPENDED,
      });
    });

    it('should throw error when employee not found', async () => {
      // Arrange
      companyUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.execute({ companyUserId: 'cu-123' }),
      ).rejects.toThrow(new EntityNotFoundException('Funcionário', 'cu-123'));
    });

    it('should throw error when trying to suspend invited employee', async () => {
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

    it('should throw error when trying to suspend already suspended employee', async () => {
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

      companyUserRepository.findById.mockResolvedValue(suspendedEmployee);

      // Act & Assert
      await expect(
        service.execute({ companyUserId: 'cu-123' }),
      ).rejects.toThrow(DomainValidationException);
    });
  });
});

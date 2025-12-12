import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import { DomainValidationException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { ErrorMessages } from '@/shared/constants/error-messages';
import { ValidatePlanLimitsService } from '../validate-plan-limits.service';

describe('ValidatePlanLimitsService', () => {
  let service: ValidatePlanLimitsService;
  let companyUserRepository: jest.Mocked<CompanyUserRepository>;

  beforeEach(() => {
    companyUserRepository = {
      countByAdminIdRoleAndStatus: jest.fn(),
    } as any;

    service = new ValidatePlanLimitsService(companyUserRepository);
  });

  describe('validateRoleLimit', () => {
    it('should pass validation when current count is below limit', async () => {
      // Arrange
      const adminId = 'admin-123';
      const role = UserRole.MANAGER;
      const maxLimit = 10;

      companyUserRepository.countByAdminIdRoleAndStatus.mockResolvedValue(5);

      // Act & Assert
      await expect(
        service.validateRoleLimit(adminId, role, maxLimit),
      ).resolves.not.toThrow();

      expect(
        companyUserRepository.countByAdminIdRoleAndStatus,
      ).toHaveBeenCalledWith(adminId, role, CompanyUserStatus.ACTIVE);
    });

    it('should pass validation when current count equals limit - 1', async () => {
      // Arrange
      const adminId = 'admin-123';
      const role = UserRole.EXECUTOR;
      const maxLimit = 10;

      companyUserRepository.countByAdminIdRoleAndStatus.mockResolvedValue(9);

      // Act & Assert
      await expect(
        service.validateRoleLimit(adminId, role, maxLimit),
      ).resolves.not.toThrow();
    });

    it('should throw error when current count equals limit (MANAGER)', async () => {
      // Arrange
      const adminId = 'admin-123';
      const role = UserRole.MANAGER;
      const maxLimit = 5;

      companyUserRepository.countByAdminIdRoleAndStatus.mockResolvedValue(5);

      // Act & Assert
      await expect(
        service.validateRoleLimit(adminId, role, maxLimit),
      ).rejects.toThrow(
        new DomainValidationException(
          ErrorMessages.COMPANY_USER.MAX_MANAGERS_EXCEEDED,
        ),
      );
    });

    it('should throw error when current count exceeds limit (EXECUTOR)', async () => {
      // Arrange
      const adminId = 'admin-123';
      const role = UserRole.EXECUTOR;
      const maxLimit = 10;

      companyUserRepository.countByAdminIdRoleAndStatus.mockResolvedValue(15);

      // Act & Assert
      await expect(
        service.validateRoleLimit(adminId, role, maxLimit),
      ).rejects.toThrow(
        new DomainValidationException(
          ErrorMessages.COMPANY_USER.MAX_EXECUTORS_EXCEEDED,
        ),
      );
    });

    it('should throw error when limit is reached (CONSULTANT)', async () => {
      // Arrange
      const adminId = 'admin-123';
      const role = UserRole.CONSULTANT;
      const maxLimit = 3;

      companyUserRepository.countByAdminIdRoleAndStatus.mockResolvedValue(3);

      // Act & Assert
      await expect(
        service.validateRoleLimit(adminId, role, maxLimit),
      ).rejects.toThrow(
        new DomainValidationException(
          ErrorMessages.COMPANY_USER.MAX_CONSULTANTS_EXCEEDED,
        ),
      );
    });

    it('should throw error when limit is 0 (not allowed)', async () => {
      // Arrange
      const adminId = 'admin-123';
      const role = UserRole.MANAGER;
      const maxLimit = 0;

      companyUserRepository.countByAdminIdRoleAndStatus.mockResolvedValue(0);

      // Act & Assert
      await expect(
        service.validateRoleLimit(adminId, role, maxLimit),
      ).rejects.toThrow(
        new DomainValidationException(
          ErrorMessages.COMPANY_USER.MAX_MANAGERS_EXCEEDED,
        ),
      );
    });

    it('should count only ACTIVE employees', async () => {
      // Arrange
      const adminId = 'admin-123';
      const role = UserRole.MANAGER;
      const maxLimit = 10;

      companyUserRepository.countByAdminIdRoleAndStatus.mockResolvedValue(3);

      // Act
      await service.validateRoleLimit(adminId, role, maxLimit);

      // Assert
      expect(
        companyUserRepository.countByAdminIdRoleAndStatus,
      ).toHaveBeenCalledWith(adminId, role, CompanyUserStatus.ACTIVE);
    });
  });
});

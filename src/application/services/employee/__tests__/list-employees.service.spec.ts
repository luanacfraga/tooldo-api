/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
import { CompanyUser } from '@/core/domain/company-user/company-user.entity';
import { Company } from '@/core/domain/company/company.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { ListEmployeesService } from '../list-employees.service';

describe('ListEmployeesService', () => {
  let service: ListEmployeesService;
  let companyRepository: jest.Mocked<CompanyRepository>;
  let companyUserRepository: jest.Mocked<CompanyUserRepository>;

  const mockCompany = Company.create({
    id: 'company-123',
    name: 'Test Company',
    description: 'Description',
    adminId: 'admin-123',
  });

  const mockEmployees = [
    new CompanyUser(
      'cu-1',
      'company-123',
      'user-1',
      UserRole.MANAGER,
      CompanyUserStatus.ACTIVE,
      'Manager',
      null,
      null,
      new Date(),
      'admin-123',
      new Date(),
    ),
    new CompanyUser(
      'cu-2',
      'company-123',
      'user-2',
      UserRole.EXECUTOR,
      CompanyUserStatus.ACTIVE,
      'Developer',
      null,
      null,
      new Date(),
      'admin-123',
      new Date(),
    ),
  ];

  beforeEach(() => {
    companyRepository = {
      findById: jest.fn(),
    } as any;

    companyUserRepository = {
      findByCompanyId: jest.fn(),
      findByCompanyIdAndStatus: jest.fn(),
      findByCompanyIdPaginated: jest.fn(),
    } as any;

    service = new ListEmployeesService(
      companyRepository,
      companyUserRepository,
    );
  });

  describe('execute', () => {
    it('should list all employees when no status filter', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      companyUserRepository.findByCompanyIdPaginated.mockResolvedValue({
        employees: mockEmployees,
        total: mockEmployees.length,
      });

      // Act
      const result = await service.execute({ companyId: 'company-123' });

      // Assert
      expect(result.employees).toEqual(mockEmployees);
      expect(result.total).toBe(mockEmployees.length);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(
        companyUserRepository.findByCompanyIdPaginated,
      ).toHaveBeenCalledWith('company-123', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: undefined,
      });
    });

    it('should list employees filtered by status', async () => {
      // Arrange
      const activeEmployees = mockEmployees.filter(
        (e) => e.status === CompanyUserStatus.ACTIVE,
      );
      companyRepository.findById.mockResolvedValue(mockCompany);
      companyUserRepository.findByCompanyIdPaginated.mockResolvedValue({
        employees: activeEmployees,
        total: activeEmployees.length,
      });

      // Act
      const result = await service.execute({
        companyId: 'company-123',
        status: CompanyUserStatus.ACTIVE,
      });

      // Assert
      expect(result.employees).toEqual(activeEmployees);
      expect(result.total).toBe(activeEmployees.length);
      expect(
        companyUserRepository.findByCompanyIdPaginated,
      ).toHaveBeenCalledWith('company-123', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: CompanyUserStatus.ACTIVE,
      });
    });

    it('should throw error when company not found', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.execute({ companyId: 'company-123' }),
      ).rejects.toThrow(new EntityNotFoundException('Empresa', 'company-123'));
    });

    it('should return empty array when no employees', async () => {
      // Arrange
      companyRepository.findById.mockResolvedValue(mockCompany);
      companyUserRepository.findByCompanyIdPaginated.mockResolvedValue({
        employees: [],
        total: 0,
      });

      // Act
      const result = await service.execute({ companyId: 'company-123' });

      // Assert
      expect(result.employees).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });
});

/* eslint-disable @typescript-eslint/unbound-method */
import { Plan } from '@/core/domain/plan/plan.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePlanService } from './update-plan.service';

describe('UpdatePlanService', () => {
  let service: UpdatePlanService;
  let planRepository: jest.Mocked<PlanRepository>;

  const mockPlanId = '123e4567-e89b-12d3-a456-426614174000';
  const mockExistingPlan = Plan.create({
    id: mockPlanId,
    name: 'Plano Básico',
    maxCompanies: 5,
    maxManagers: 10,
    maxExecutors: 20,
    maxConsultants: 15,
    iaCallsLimit: 1000,
  });

  const mockUpdateInput = {
    id: mockPlanId,
    name: 'Plano Premium Atualizado',
    maxCompanies: 50,
    maxManagers: 100,
    maxExecutors: 200,
    maxConsultants: 150,
    iaCallsLimit: 10000,
  };

  beforeEach(async () => {
    const mockPlanRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePlanService,
        {
          provide: 'PlanRepository',
          useValue: mockPlanRepository,
        },
      ],
    }).compile();

    service = module.get<UpdatePlanService>(UpdatePlanService);
    planRepository = module.get('PlanRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should update a plan successfully', async () => {
      planRepository.findById.mockResolvedValue(mockExistingPlan);
      planRepository.update.mockImplementation((plan: Plan) =>
        Promise.resolve(plan),
      );

      const result = await service.execute(mockUpdateInput);

      expect(result).toBeInstanceOf(Plan);
      expect(result.id).toBe(mockUpdateInput.id);
      expect(result.name).toBe(mockUpdateInput.name);
      expect(result.maxCompanies).toBe(mockUpdateInput.maxCompanies);
      expect(result.maxManagers).toBe(mockUpdateInput.maxManagers);
      expect(result.maxExecutors).toBe(mockUpdateInput.maxExecutors);
      expect(result.maxConsultants).toBe(mockUpdateInput.maxConsultants);
      expect(result.iaCallsLimit).toBe(mockUpdateInput.iaCallsLimit);
      expect(planRepository.findById).toHaveBeenCalledWith(mockPlanId);
      expect(planRepository.update).toHaveBeenCalledTimes(1);
      const updateCall = planRepository.update.mock.calls[0][0];
      expect(updateCall).toBeInstanceOf(Plan);
      expect(updateCall.id).toBe(mockUpdateInput.id);
      expect(updateCall.name).toBe(mockUpdateInput.name);
    });

    it('should throw EntityNotFoundException when plan does not exist', async () => {
      planRepository.findById.mockResolvedValue(null);

      await expect(service.execute(mockUpdateInput)).rejects.toThrow(
        EntityNotFoundException,
      );
      await expect(service.execute(mockUpdateInput)).rejects.toThrow(
        `Plano com identificador '${mockPlanId}' não foi encontrado(a)`,
      );
      expect(planRepository.findById).toHaveBeenCalledWith(mockPlanId);
      expect(planRepository.update).not.toHaveBeenCalled();
    });

    it('should update plan with zero limits', async () => {
      const zeroLimitsInput = {
        id: mockPlanId,
        name: 'Plano Grátis',
        maxCompanies: 0,
        maxManagers: 0,
        maxExecutors: 0,
        maxConsultants: 0,
        iaCallsLimit: 0,
      };

      planRepository.findById.mockResolvedValue(mockExistingPlan);
      planRepository.update.mockImplementation((plan: Plan) =>
        Promise.resolve(plan),
      );

      const result = await service.execute(zeroLimitsInput);

      expect(result).toBeInstanceOf(Plan);
      expect(result.id).toBe(mockPlanId);
      expect(result.name).toBe(zeroLimitsInput.name);
      expect(result.maxCompanies).toBe(0);
      expect(result.maxManagers).toBe(0);
      expect(result.maxExecutors).toBe(0);
      expect(result.maxConsultants).toBe(0);
      expect(result.iaCallsLimit).toBe(0);
      expect(planRepository.findById).toHaveBeenCalledWith(mockPlanId);
      expect(planRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update only name while keeping other properties', async () => {
      const nameOnlyUpdate = {
        id: mockPlanId,
        name: 'Novo Nome do Plano',
        maxCompanies: mockExistingPlan.maxCompanies,
        maxManagers: mockExistingPlan.maxManagers,
        maxExecutors: mockExistingPlan.maxExecutors,
        maxConsultants: mockExistingPlan.maxConsultants,
        iaCallsLimit: mockExistingPlan.iaCallsLimit,
      };

      planRepository.findById.mockResolvedValue(mockExistingPlan);
      planRepository.update.mockImplementation((plan: Plan) =>
        Promise.resolve(plan),
      );

      const result = await service.execute(nameOnlyUpdate);

      expect(result).toBeInstanceOf(Plan);
      expect(result.id).toBe(mockPlanId);
      expect(result.name).toBe(nameOnlyUpdate.name);
      expect(result.maxCompanies).toBe(mockExistingPlan.maxCompanies);
      expect(result.maxManagers).toBe(mockExistingPlan.maxManagers);
      expect(result.maxExecutors).toBe(mockExistingPlan.maxExecutors);
      expect(result.maxConsultants).toBe(mockExistingPlan.maxConsultants);
      expect(result.iaCallsLimit).toBe(mockExistingPlan.iaCallsLimit);
    });

    it('should call repository methods in correct order', async () => {
      planRepository.findById.mockResolvedValue(mockExistingPlan);
      planRepository.update.mockImplementation((plan: Plan) =>
        Promise.resolve(plan),
      );

      await service.execute(mockUpdateInput);

      expect(planRepository.findById).toHaveBeenCalledTimes(1);
      expect(planRepository.update).toHaveBeenCalledTimes(1);
      expect(planRepository.findById).toHaveBeenCalledWith(mockPlanId);
    });
  });
});

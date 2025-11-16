/* eslint-disable @typescript-eslint/unbound-method */
import { Plan } from '@/core/domain/plan/plan.entity';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { IdGenerator } from '@/core/ports/services/id-generator.port';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlanService } from './create-plan.service';

describe('CreatePlanService', () => {
  let service: CreatePlanService;
  let planRepository: jest.Mocked<PlanRepository>;
  let idGenerator: jest.Mocked<IdGenerator>;

  const mockPlanId = '123e4567-e89b-12d3-a456-426614174000';
  const mockPlanInput = {
    name: 'Plano Básico',
    maxCompanies: 5,
    maxManagers: 10,
    maxExecutors: 20,
    maxConsultants: 15,
    iaCallsLimit: 1000,
  };

  beforeEach(async () => {
    const mockPlanRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
    };

    const mockIdGenerator = {
      generate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePlanService,
        {
          provide: 'PlanRepository',
          useValue: mockPlanRepository,
        },
        {
          provide: 'IdGenerator',
          useValue: mockIdGenerator,
        },
      ],
    }).compile();

    service = module.get<CreatePlanService>(CreatePlanService);
    planRepository = module.get('PlanRepository');
    idGenerator = module.get('IdGenerator');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should create a plan successfully', async () => {
      idGenerator.generate.mockReturnValue(mockPlanId);
      planRepository.create.mockImplementation(async (plan: Plan) => plan);

      const result = await service.execute(mockPlanInput);

      expect(result).toBeInstanceOf(Plan);
      expect(result.id).toBe(mockPlanId);
      expect(result.name).toBe(mockPlanInput.name);
      expect(result.maxCompanies).toBe(mockPlanInput.maxCompanies);
      expect(result.maxManagers).toBe(mockPlanInput.maxManagers);
      expect(result.maxExecutors).toBe(mockPlanInput.maxExecutors);
      expect(result.maxConsultants).toBe(mockPlanInput.maxConsultants);
      expect(result.iaCallsLimit).toBe(mockPlanInput.iaCallsLimit);
      expect(idGenerator.generate).toHaveBeenCalledTimes(1);
      expect(planRepository.create).toHaveBeenCalledTimes(1);
      const createCall = planRepository.create.mock.calls[0][0];
      expect(createCall).toBeInstanceOf(Plan);
      expect(createCall.id).toBe(mockPlanId);
      expect(createCall.name).toBe(mockPlanInput.name);
      expect(createCall.maxCompanies).toBe(mockPlanInput.maxCompanies);
      expect(createCall.maxManagers).toBe(mockPlanInput.maxManagers);
      expect(createCall.maxExecutors).toBe(mockPlanInput.maxExecutors);
      expect(createCall.maxConsultants).toBe(mockPlanInput.maxConsultants);
      expect(createCall.iaCallsLimit).toBe(mockPlanInput.iaCallsLimit);
    });

    it('should generate a unique ID for each plan', async () => {
      const firstPlanId = 'first-plan-id';
      const secondPlanId = 'second-plan-id';

      idGenerator.generate
        .mockReturnValueOnce(firstPlanId)
        .mockReturnValueOnce(secondPlanId);
      planRepository.create.mockImplementation(async (plan: Plan) => plan);

      const result1 = await service.execute(mockPlanInput);
      const result2 = await service.execute({
        ...mockPlanInput,
        name: 'Plano Premium',
      });

      expect(result1.id).toBe(firstPlanId);
      expect(result2.id).toBe(secondPlanId);
      expect(idGenerator.generate).toHaveBeenCalledTimes(2);
      expect(planRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should pass all plan properties correctly to repository', async () => {
      const customInput = {
        name: 'Plano Enterprise',
        maxCompanies: 100,
        maxManagers: 500,
        maxExecutors: 1000,
        maxConsultants: 200,
        iaCallsLimit: 50000,
      };

      idGenerator.generate.mockReturnValue(mockPlanId);
      planRepository.create.mockImplementation(async (plan: Plan) => plan);

      const result = await service.execute(customInput);

      expect(result).toBeInstanceOf(Plan);
      expect(result.id).toBe(mockPlanId);
      expect(result.name).toBe(customInput.name);
      expect(result.maxCompanies).toBe(customInput.maxCompanies);
      expect(result.maxManagers).toBe(customInput.maxManagers);
      expect(result.maxExecutors).toBe(customInput.maxExecutors);
      expect(result.maxConsultants).toBe(customInput.maxConsultants);
      expect(result.iaCallsLimit).toBe(customInput.iaCallsLimit);
      const createCall = planRepository.create.mock.calls[0][0];
      expect(createCall).toBeInstanceOf(Plan);
      expect(createCall.id).toBe(mockPlanId);
      expect(createCall.name).toBe(customInput.name);
      expect(createCall.maxCompanies).toBe(customInput.maxCompanies);
      expect(createCall.maxManagers).toBe(customInput.maxManagers);
      expect(createCall.maxExecutors).toBe(customInput.maxExecutors);
      expect(createCall.maxConsultants).toBe(customInput.maxConsultants);
      expect(createCall.iaCallsLimit).toBe(customInput.iaCallsLimit);
    });

    it('should handle plan with zero limits', async () => {
      const zeroLimitsInput = {
        name: 'Plano Grátis',
        maxCompanies: 0,
        maxManagers: 0,
        maxExecutors: 0,
        maxConsultants: 0,
        iaCallsLimit: 0,
      };

      idGenerator.generate.mockReturnValue(mockPlanId);
      planRepository.create.mockImplementation(async (plan: Plan) => plan);

      const result = await service.execute(zeroLimitsInput);

      expect(result).toBeInstanceOf(Plan);
      expect(result.name).toBe(zeroLimitsInput.name);
      expect(result.maxCompanies).toBe(0);
      expect(result.maxManagers).toBe(0);
      expect(result.maxExecutors).toBe(0);
      expect(result.maxConsultants).toBe(0);
      expect(result.iaCallsLimit).toBe(0);
      const createCall = planRepository.create.mock.calls[0][0];
      expect(createCall).toBeInstanceOf(Plan);
      expect(createCall.name).toBe(zeroLimitsInput.name);
      expect(createCall.maxCompanies).toBe(0);
      expect(createCall.maxManagers).toBe(0);
      expect(createCall.maxExecutors).toBe(0);
      expect(createCall.maxConsultants).toBe(0);
      expect(createCall.iaCallsLimit).toBe(0);
    });
  });
});

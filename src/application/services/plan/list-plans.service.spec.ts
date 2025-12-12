/* eslint-disable @typescript-eslint/unbound-method */
import { Plan } from '@/core/domain/plan/plan.entity';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ListPlansService } from './list-plans.service';

describe('ListPlansService', () => {
  let service: ListPlansService;
  let planRepository: jest.Mocked<PlanRepository>;

  const mockPlan1 = Plan.create({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Plano Básico',
    maxCompanies: 5,
    maxManagers: 10,
    maxExecutors: 20,
    maxConsultants: 15,
    iaCallsLimit: 1000,
  });

  const mockPlan2 = Plan.create({
    id: '223e4567-e89b-12d3-a456-426614174001',
    name: 'Plano Premium',
    maxCompanies: 50,
    maxManagers: 100,
    maxExecutors: 200,
    maxConsultants: 150,
    iaCallsLimit: 10000,
  });

  const mockPlan3 = Plan.create({
    id: '323e4567-e89b-12d3-a456-426614174002',
    name: 'Plano Enterprise',
    maxCompanies: 100,
    maxManagers: 500,
    maxExecutors: 1000,
    maxConsultants: 200,
    iaCallsLimit: 50000,
  });

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
        ListPlansService,
        {
          provide: 'PlanRepository',
          useValue: mockPlanRepository,
        },
      ],
    }).compile();

    service = module.get<ListPlansService>(ListPlansService);
    planRepository = module.get('PlanRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should return an empty array when no plans exist', async () => {
      planRepository.findAll.mockResolvedValue([]);

      const result = await service.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(planRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return a list of plans successfully', async () => {
      const mockPlans = [mockPlan1, mockPlan2];
      planRepository.findAll.mockResolvedValue(mockPlans);

      const result = await service.execute();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Plan);
      expect(result[0].id).toBe(mockPlan1.id);
      expect(result[0].name).toBe(mockPlan1.name);
      expect(result[1]).toBeInstanceOf(Plan);
      expect(result[1].id).toBe(mockPlan2.id);
      expect(result[1].name).toBe(mockPlan2.name);
      expect(planRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return all plans with correct properties', async () => {
      const mockPlans = [mockPlan1, mockPlan2, mockPlan3];
      planRepository.findAll.mockResolvedValue(mockPlans);

      const result = await service.execute();

      expect(result).toHaveLength(3);
      result.forEach((plan, index) => {
        expect(plan).toBeInstanceOf(Plan);
        expect(plan.id).toBe(mockPlans[index].id);
        expect(plan.name).toBe(mockPlans[index].name);
        expect(plan.maxCompanies).toBe(mockPlans[index].maxCompanies);
        expect(plan.maxManagers).toBe(mockPlans[index].maxManagers);
        expect(plan.maxExecutors).toBe(mockPlans[index].maxExecutors);
        expect(plan.maxConsultants).toBe(mockPlans[index].maxConsultants);
        expect(plan.iaCallsLimit).toBe(mockPlans[index].iaCallsLimit);
      });
      expect(planRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should call repository findAll method exactly once', async () => {
      planRepository.findAll.mockResolvedValue([mockPlan1]);

      await service.execute();

      expect(planRepository.findAll).toHaveBeenCalledTimes(1);
      expect(planRepository.findAll).toHaveBeenCalledWith();
    });
  });
});

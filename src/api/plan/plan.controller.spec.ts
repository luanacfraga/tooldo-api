/* eslint-disable @typescript-eslint/unbound-method */
import { CreatePlanService } from '@/application/services/plan/create-plan.service';
import { ListPlansService } from '@/application/services/plan/list-plans.service';
import { UpdatePlanService } from '@/application/services/plan/update-plan.service';
import { Plan } from '@/core/domain/plan/plan.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanController } from './plan.controller';

describe('PlanController', () => {
  let controller: PlanController;
  let createPlanService: jest.Mocked<CreatePlanService>;
  let listPlansService: jest.Mocked<ListPlansService>;
  let updatePlanService: jest.Mocked<UpdatePlanService>;

  const mockPlanId = '123e4567-e89b-12d3-a456-426614174000';
  const mockPlan = new Plan(
    mockPlanId,
    'Plano Premium',
    50,
    100,
    200,
    150,
    10000,
  );

  const mockCreatePlanDto: CreatePlanDto = {
    name: 'Plano Premium',
    maxCompanies: 50,
    maxManagers: 100,
    maxExecutors: 200,
    maxConsultants: 150,
    iaCallsLimit: 10000,
  };

  const mockUpdatePlanDto: Omit<UpdatePlanDto, 'id'> = {
    name: 'Plano Premium Atualizado',
    maxCompanies: 100,
    maxManagers: 200,
    maxExecutors: 400,
    maxConsultants: 300,
    iaCallsLimit: 20000,
  };

  beforeEach(async () => {
    const mockCreatePlanService = {
      execute: jest.fn(),
    };

    const mockListPlansService = {
      execute: jest.fn(),
    };

    const mockUpdatePlanService = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanController],
      providers: [
        {
          provide: CreatePlanService,
          useValue: mockCreatePlanService,
        },
        {
          provide: ListPlansService,
          useValue: mockListPlansService,
        },
        {
          provide: UpdatePlanService,
          useValue: mockUpdatePlanService,
        },
      ],
    }).compile();

    controller = module.get<PlanController>(PlanController);
    createPlanService = module.get(CreatePlanService);
    listPlansService = module.get(ListPlansService);
    updatePlanService = module.get(UpdatePlanService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a plan and return PlanResponseDto', async () => {
      createPlanService.execute.mockResolvedValue(mockPlan);

      const result = await controller.create(mockCreatePlanDto);

      expect(result).toBeInstanceOf(PlanResponseDto);
      expect(result.id).toBe(mockPlan.id);
      expect(result.name).toBe(mockPlan.name);
      expect(result.maxCompanies).toBe(mockPlan.maxCompanies);
      expect(result.maxManagers).toBe(mockPlan.maxManagers);
      expect(result.maxExecutors).toBe(mockPlan.maxExecutors);
      expect(result.maxConsultants).toBe(mockPlan.maxConsultants);
      expect(result.iaCallsLimit).toBe(mockPlan.iaCallsLimit);
      expect(createPlanService.execute).toHaveBeenCalledWith(mockCreatePlanDto);
      expect(createPlanService.execute).toHaveBeenCalledTimes(1);
    });

    it('should convert domain Plan to PlanResponseDto correctly', async () => {
      const customPlan = new Plan(
        'custom-id',
        'Custom Plan',
        10,
        20,
        30,
        25,
        5000,
      );
      createPlanService.execute.mockResolvedValue(customPlan);

      const result = await controller.create(mockCreatePlanDto);

      expect(result).toBeInstanceOf(PlanResponseDto);
      expect(result.id).toBe(customPlan.id);
      expect(result.name).toBe(customPlan.name);
      expect(result.maxCompanies).toBe(customPlan.maxCompanies);
      expect(result.maxManagers).toBe(customPlan.maxManagers);
      expect(result.maxExecutors).toBe(customPlan.maxExecutors);
      expect(result.maxConsultants).toBe(customPlan.maxConsultants);
      expect(result.iaCallsLimit).toBe(customPlan.iaCallsLimit);
    });
  });

  describe('list', () => {
    it('should return an empty array when no plans exist', async () => {
      listPlansService.execute.mockResolvedValue([]);

      const result = await controller.list();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(listPlansService.execute).toHaveBeenCalledTimes(1);
      expect(listPlansService.execute).toHaveBeenCalledWith();
    });

    it('should return a list of plans as PlanResponseDto array', async () => {
      const mockPlans = [
        mockPlan,
        new Plan(
          '223e4567-e89b-12d3-a456-426614174001',
          'Plano Básico',
          5,
          10,
          20,
          15,
          1000,
        ),
      ];
      listPlansService.execute.mockResolvedValue(mockPlans);

      const result = await controller.list();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PlanResponseDto);
      expect(result[0].id).toBe(mockPlans[0].id);
      expect(result[0].name).toBe(mockPlans[0].name);
      expect(result[1]).toBeInstanceOf(PlanResponseDto);
      expect(result[1].id).toBe(mockPlans[1].id);
      expect(result[1].name).toBe(mockPlans[1].name);
      expect(listPlansService.execute).toHaveBeenCalledTimes(1);
    });

    it('should map all plans to PlanResponseDto correctly', async () => {
      const mockPlans = [mockPlan];
      listPlansService.execute.mockResolvedValue(mockPlans);

      const result = await controller.list();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PlanResponseDto);
      expect(result[0].id).toBe(mockPlan.id);
      expect(result[0].name).toBe(mockPlan.name);
      expect(result[0].maxCompanies).toBe(mockPlan.maxCompanies);
      expect(result[0].maxManagers).toBe(mockPlan.maxManagers);
      expect(result[0].maxExecutors).toBe(mockPlan.maxExecutors);
      expect(result[0].maxConsultants).toBe(mockPlan.maxConsultants);
      expect(result[0].iaCallsLimit).toBe(mockPlan.iaCallsLimit);
    });
  });

  describe('update', () => {
    it('should update a plan and return PlanResponseDto', async () => {
      const updatedPlan = new Plan(
        mockPlanId,
        mockUpdatePlanDto.name,
        mockUpdatePlanDto.maxCompanies,
        mockUpdatePlanDto.maxManagers,
        mockUpdatePlanDto.maxExecutors,
        mockUpdatePlanDto.maxConsultants,
        mockUpdatePlanDto.iaCallsLimit,
      );
      updatePlanService.execute.mockResolvedValue(updatedPlan);

      const result = await controller.update(mockPlanId, mockUpdatePlanDto);

      expect(result).toBeInstanceOf(PlanResponseDto);
      expect(result.id).toBe(mockPlanId);
      expect(result.name).toBe(mockUpdatePlanDto.name);
      expect(result.maxCompanies).toBe(mockUpdatePlanDto.maxCompanies);
      expect(result.maxManagers).toBe(mockUpdatePlanDto.maxManagers);
      expect(result.maxExecutors).toBe(mockUpdatePlanDto.maxExecutors);
      expect(result.maxConsultants).toBe(mockUpdatePlanDto.maxConsultants);
      expect(result.iaCallsLimit).toBe(mockUpdatePlanDto.iaCallsLimit);
      expect(updatePlanService.execute).toHaveBeenCalledWith({
        ...mockUpdatePlanDto,
        id: mockPlanId,
      });
      expect(updatePlanService.execute).toHaveBeenCalledTimes(1);
    });

    it('should combine id from param with dto body correctly', async () => {
      const customId = 'custom-plan-id';
      const updatedPlan = new Plan(
        customId,
        mockUpdatePlanDto.name,
        mockUpdatePlanDto.maxCompanies,
        mockUpdatePlanDto.maxManagers,
        mockUpdatePlanDto.maxExecutors,
        mockUpdatePlanDto.maxConsultants,
        mockUpdatePlanDto.iaCallsLimit,
      );
      updatePlanService.execute.mockResolvedValue(updatedPlan);

      await controller.update(customId, mockUpdatePlanDto);

      expect(updatePlanService.execute).toHaveBeenCalledWith({
        ...mockUpdatePlanDto,
        id: customId,
      });
    });

    it('should throw EntityNotFoundException when plan does not exist', async () => {
      updatePlanService.execute.mockRejectedValue(
        new EntityNotFoundException('Plano', mockPlanId),
      );

      await expect(
        controller.update(mockPlanId, mockUpdatePlanDto),
      ).rejects.toThrow(EntityNotFoundException);
      expect(updatePlanService.execute).toHaveBeenCalledWith({
        ...mockUpdatePlanDto,
        id: mockPlanId,
      });
    });
  });
});

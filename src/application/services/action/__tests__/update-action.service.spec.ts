/* eslint-disable @typescript-eslint/unbound-method */
import { Action } from '@/core/domain/action/action.entity';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import type { ActionRepository } from '@/core/ports/repositories/action.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateActionService } from '../update-action.service';

describe('UpdateActionService - Date-Driven Status Transitions', () => {
  let service: UpdateActionService;
  let actionRepository: jest.Mocked<ActionRepository>;

  const mockActionId = '123e4567-e89b-12d3-a456-426614174000';
  const mockCompanyId = 'company-123';
  const mockUserId = 'user-123';
  const mockResponsibleId = 'user-456';

  const createMockAction = (
    status: ActionStatus,
    actualStartDate: Date | null = null,
    actualEndDate: Date | null = null,
    options?: { withTeam?: boolean },
  ): Action => {
    const teamId = options?.withTeam ? 'team-123' : null;
    const responsibleId = teamId ? mockResponsibleId : mockUserId;
    return new Action(
      mockActionId,
      'Root Cause',
      'Test Action',
      'Test Description',
      status,
      ActionPriority.MEDIUM,
      new Date('2024-01-01'),
      new Date('2024-01-31'),
      actualStartDate,
      actualEndDate,
      false,
      false,
      null,
      mockCompanyId,
      teamId,
      mockUserId,
      responsibleId,
      null,
    );
  };

  beforeEach(async () => {
    const mockActionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      updateWithKanbanOrder: jest.fn(),
      findLastKanbanOrderInColumn: jest.fn(),
      findKanbanOrderByActionId: jest.fn(),
      updateActionsPositionInColumn: jest.fn(),
    };

    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockChecklistItemRepository = {
      deleteByActionId: jest.fn(),
      create: jest.fn(),
    };

    const mockTransactionManager = {
      execute: jest.fn((callback) => callback(null)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateActionService,
        {
          provide: 'ActionRepository',
          useValue: mockActionRepository,
        },
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'ChecklistItemRepository',
          useValue: mockChecklistItemRepository,
        },
        {
          provide: 'TransactionManager',
          useValue: mockTransactionManager,
        },
      ],
    }).compile();

    service = module.get<UpdateActionService>(UpdateActionService);
    actionRepository = module.get('ActionRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Setting actualStartDate should move action to IN_PROGRESS', () => {
    it('should move action from TODO to IN_PROGRESS when actualStartDate is set', async () => {
      const mockAction = createMockAction(ActionStatus.TODO);
      const newStartDate = new Date('2024-01-05');

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.findLastKanbanOrderInColumn.mockResolvedValue({
        position: 5,
      });
      actionRepository.findKanbanOrderByActionId.mockResolvedValue({
        column: ActionStatus.TODO,
        position: 2,
        lastMovedAt: new Date(),
      });
      actionRepository.updateWithKanbanOrder.mockImplementation((_id, data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            mockAction.title,
            mockAction.description,
            data.status!,
            mockAction.priority,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            newStartDate,
            null,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        actualStartDate: newStartDate,
      });

      expect(result.action.status).toBe(ActionStatus.IN_PROGRESS);
      expect(result.action.actualStartDate).toEqual(newStartDate);
      expect(actionRepository.updateWithKanbanOrder).toHaveBeenCalledWith(
        mockActionId,
        expect.objectContaining({
          status: ActionStatus.IN_PROGRESS,
          actualStartDate: newStartDate,
        }),
        expect.objectContaining({
          column: ActionStatus.IN_PROGRESS,
          position: 6,
        }),
        null,
      );
    });

    it('should NOT change status when actualStartDate is set and action is already IN_PROGRESS', async () => {
      const existingStartDate = new Date('2024-01-03');
      const mockAction = createMockAction(
        ActionStatus.IN_PROGRESS,
        existingStartDate,
      );
      const newStartDate = new Date('2024-01-05');

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.update.mockImplementation((_id, _data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            mockAction.title,
            mockAction.description,
            ActionStatus.IN_PROGRESS,
            mockAction.priority,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            newStartDate,
            null,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        actualStartDate: newStartDate,
      });

      expect(result.action.status).toBe(ActionStatus.IN_PROGRESS);
      expect(actionRepository.update).toHaveBeenCalled();
      expect(actionRepository.updateWithKanbanOrder).not.toHaveBeenCalled();
    });

    it('should NOT change status when actualStartDate is set and action is DONE', async () => {
      const existingStartDate = new Date('2024-01-03');
      const existingEndDate = new Date('2024-01-30');
      const mockAction = createMockAction(
        ActionStatus.DONE,
        existingStartDate,
        existingEndDate,
      );
      const newStartDate = new Date('2024-01-05');

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.update.mockImplementation((_id, _data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            mockAction.title,
            mockAction.description,
            ActionStatus.DONE,
            mockAction.priority,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            newStartDate,
            existingEndDate,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        actualStartDate: newStartDate,
      });

      expect(result.action.status).toBe(ActionStatus.DONE);
      expect(actionRepository.update).toHaveBeenCalled();
      expect(actionRepository.updateWithKanbanOrder).not.toHaveBeenCalled();
    });
  });

  describe('Setting actualEndDate should move action to DONE', () => {
    it('should move action from TODO to DONE when actualEndDate is set', async () => {
      const mockAction = createMockAction(ActionStatus.TODO);
      const newEndDate = new Date('2024-01-30');

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.findLastKanbanOrderInColumn.mockResolvedValue({
        position: 10,
      });
      actionRepository.findKanbanOrderByActionId.mockResolvedValue({
        column: ActionStatus.TODO,
        position: 2,
        lastMovedAt: new Date(),
      });
      actionRepository.updateWithKanbanOrder.mockImplementation((_id, data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            mockAction.title,
            mockAction.description,
            data.status!,
            mockAction.priority,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            null,
            newEndDate,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        actualEndDate: newEndDate,
      });

      expect(result.action.status).toBe(ActionStatus.DONE);
      expect(result.action.actualEndDate).toEqual(newEndDate);
      expect(actionRepository.updateWithKanbanOrder).toHaveBeenCalledWith(
        mockActionId,
        expect.objectContaining({
          status: ActionStatus.DONE,
          actualEndDate: newEndDate,
        }),
        expect.objectContaining({
          column: ActionStatus.DONE,
          position: 11,
        }),
        null,
      );
    });

    it('should move action from IN_PROGRESS to DONE when actualEndDate is set', async () => {
      const existingStartDate = new Date('2024-01-05');
      const mockAction = createMockAction(
        ActionStatus.IN_PROGRESS,
        existingStartDate,
      );
      const newEndDate = new Date('2024-01-30');

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.findLastKanbanOrderInColumn.mockResolvedValue({
        position: 10,
      });
      actionRepository.findKanbanOrderByActionId.mockResolvedValue({
        column: ActionStatus.IN_PROGRESS,
        position: 3,
        lastMovedAt: new Date(),
      });
      actionRepository.updateWithKanbanOrder.mockImplementation((_id, data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            mockAction.title,
            mockAction.description,
            data.status!,
            mockAction.priority,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            existingStartDate,
            newEndDate,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        actualEndDate: newEndDate,
      });

      expect(result.action.status).toBe(ActionStatus.DONE);
      expect(result.action.actualEndDate).toEqual(newEndDate);
      expect(actionRepository.updateWithKanbanOrder).toHaveBeenCalledWith(
        mockActionId,
        expect.objectContaining({
          status: ActionStatus.DONE,
          actualEndDate: newEndDate,
        }),
        expect.objectContaining({
          column: ActionStatus.DONE,
          position: 11,
        }),
        null,
      );
    });

    it('should NOT change status when actualEndDate is set and action is already DONE', async () => {
      const existingStartDate = new Date('2024-01-03');
      const existingEndDate = new Date('2024-01-25');
      const mockAction = createMockAction(
        ActionStatus.DONE,
        existingStartDate,
        existingEndDate,
      );
      const newEndDate = new Date('2024-01-30');

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.update.mockImplementation((_id, _data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            mockAction.title,
            mockAction.description,
            ActionStatus.DONE,
            mockAction.priority,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            existingStartDate,
            newEndDate,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        actualEndDate: newEndDate,
      });

      expect(result.action.status).toBe(ActionStatus.DONE);
      expect(actionRepository.update).toHaveBeenCalled();
      expect(actionRepository.updateWithKanbanOrder).not.toHaveBeenCalled();
    });
  });

  describe('actualEndDate takes precedence over actualStartDate', () => {
    it('should move to DONE when both dates are set simultaneously', async () => {
      const mockAction = createMockAction(ActionStatus.TODO);
      const newStartDate = new Date('2024-01-05');
      const newEndDate = new Date('2024-01-30');

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.findLastKanbanOrderInColumn.mockResolvedValue({
        position: 10,
      });
      actionRepository.findKanbanOrderByActionId.mockResolvedValue({
        column: ActionStatus.TODO,
        position: 2,
        lastMovedAt: new Date(),
      });
      actionRepository.updateWithKanbanOrder.mockImplementation((_id, data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            mockAction.title,
            mockAction.description,
            data.status!,
            mockAction.priority,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            newStartDate,
            newEndDate,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        actualStartDate: newStartDate,
        actualEndDate: newEndDate,
      });

      expect(result.action.status).toBe(ActionStatus.DONE);
      expect(result.action.actualStartDate).toEqual(newStartDate);
      expect(result.action.actualEndDate).toEqual(newEndDate);
    });
  });

  describe('Regular updates without date changes', () => {
    it('should update action fields without changing status', async () => {
      const mockAction = createMockAction(ActionStatus.TODO);

      actionRepository.findById.mockResolvedValue(mockAction);
      actionRepository.update.mockImplementation((_id, _data) =>
        Promise.resolve(
          new Action(
            mockActionId,
            mockAction.rootCause,
            'Updated Title',
            'Updated Description',
            ActionStatus.TODO,
            ActionPriority.HIGH,
            mockAction.estimatedStartDate,
            mockAction.estimatedEndDate,
            null,
            null,
            false,
            false,
            null,
            mockCompanyId,
            null,
            mockUserId,
            mockResponsibleId,
            null,
          ),
        ),
      );

      const result = await service.execute({
        actionId: mockActionId,
        title: 'Updated Title',
        description: 'Updated Description',
        priority: ActionPriority.HIGH,
      });

      expect(result.action.status).toBe(ActionStatus.TODO);
      expect(result.action.title).toBe('Updated Title');
      expect(result.action.priority).toBe(ActionPriority.HIGH);
      expect(actionRepository.update).toHaveBeenCalled();
      expect(actionRepository.updateWithKanbanOrder).not.toHaveBeenCalled();
    });
  });
});

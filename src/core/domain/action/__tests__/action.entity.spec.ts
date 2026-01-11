import { Action } from '../action.entity';
import { ActionPriority, ActionStatus, ActionLateStatus } from '../../shared/enums';

describe('Action Entity - calculateLateStatus', () => {
  const baseActionProps = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Action',
    description: 'Test Description',
    priority: ActionPriority.MEDIUM,
    estimatedStartDate: new Date('2024-01-01'),
    estimatedEndDate: new Date('2024-01-31'),
    actualStartDate: null,
    actualEndDate: null,
    isLate: false,
    isBlocked: false,
    blockedReason: null,
    companyId: 'company-123',
    teamId: null,
    creatorId: 'user-123',
    responsibleId: 'user-456',
    deletedAt: null,
  };

  describe('LATE_TO_START', () => {
    it('should return LATE_TO_START when status is TODO and current date is after estimated start date', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.TODO,
        baseActionProps.priority,
        new Date('2024-01-01'),
        baseActionProps.estimatedEndDate,
        baseActionProps.actualStartDate,
        baseActionProps.actualEndDate,
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const currentDate = new Date('2024-01-02'); // One day after start date
      const result = action.calculateLateStatus(currentDate);

      expect(result).toBe(ActionLateStatus.LATE_TO_START);
    });

    it('should return null when status is TODO and current date equals estimated start date', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.TODO,
        baseActionProps.priority,
        new Date('2024-01-01'),
        baseActionProps.estimatedEndDate,
        baseActionProps.actualStartDate,
        baseActionProps.actualEndDate,
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const currentDate = new Date('2024-01-01'); // Same as start date
      const result = action.calculateLateStatus(currentDate);

      expect(result).toBeNull();
    });

    it('should return null when status is TODO and current date is before estimated start date', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.TODO,
        baseActionProps.priority,
        new Date('2024-01-10'),
        baseActionProps.estimatedEndDate,
        baseActionProps.actualStartDate,
        baseActionProps.actualEndDate,
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const currentDate = new Date('2024-01-05'); // Before start date
      const result = action.calculateLateStatus(currentDate);

      expect(result).toBeNull();
    });
  });

  describe('LATE_TO_FINISH', () => {
    it('should return LATE_TO_FINISH when status is IN_PROGRESS and current date is after estimated end date', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.IN_PROGRESS,
        baseActionProps.priority,
        baseActionProps.estimatedStartDate,
        new Date('2024-01-31'),
        baseActionProps.actualStartDate,
        baseActionProps.actualEndDate,
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const currentDate = new Date('2024-02-01'); // One day after end date
      const result = action.calculateLateStatus(currentDate);

      expect(result).toBe(ActionLateStatus.LATE_TO_FINISH);
    });

    it('should return null when status is IN_PROGRESS and current date equals estimated end date', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.IN_PROGRESS,
        baseActionProps.priority,
        baseActionProps.estimatedStartDate,
        new Date('2024-01-31'),
        baseActionProps.actualStartDate,
        baseActionProps.actualEndDate,
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const currentDate = new Date('2024-01-31'); // Same as end date
      const result = action.calculateLateStatus(currentDate);

      expect(result).toBeNull();
    });
  });

  describe('COMPLETED_LATE', () => {
    it('should return COMPLETED_LATE when status is DONE and actual end date is after estimated end date', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.DONE,
        baseActionProps.priority,
        baseActionProps.estimatedStartDate,
        new Date('2024-01-31'),
        baseActionProps.actualStartDate,
        new Date('2024-02-05'),
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const result = action.calculateLateStatus();

      expect(result).toBe(ActionLateStatus.COMPLETED_LATE);
    });

    it('should return null when status is DONE and actual end date equals estimated end date', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.DONE,
        baseActionProps.priority,
        baseActionProps.estimatedStartDate,
        new Date('2024-01-31'),
        baseActionProps.actualStartDate,
        new Date('2024-01-31'),
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const result = action.calculateLateStatus();

      expect(result).toBeNull();
    });

    it('should return null when status is DONE but no actual end date is set', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.DONE,
        baseActionProps.priority,
        baseActionProps.estimatedStartDate,
        new Date('2024-01-31'),
        baseActionProps.actualStartDate,
        null,
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const result = action.calculateLateStatus();

      expect(result).toBeNull();
    });
  });

  describe('Edge cases and date normalization', () => {
    it('should ignore time component when comparing dates', () => {
      const action = new Action(
        baseActionProps.id,
        baseActionProps.title,
        baseActionProps.description,
        ActionStatus.TODO,
        baseActionProps.priority,
        new Date('2024-01-01T23:59:59'),
        baseActionProps.estimatedEndDate,
        baseActionProps.actualStartDate,
        baseActionProps.actualEndDate,
        baseActionProps.isLate,
        baseActionProps.isBlocked,
        baseActionProps.blockedReason,
        baseActionProps.companyId,
        baseActionProps.teamId,
        baseActionProps.creatorId,
        baseActionProps.responsibleId,
        baseActionProps.deletedAt,
      );

      const currentDate = new Date('2024-01-01T00:00:01'); // Same day, different time
      const result = action.calculateLateStatus(currentDate);

      expect(result).toBeNull();
    });
  });
});

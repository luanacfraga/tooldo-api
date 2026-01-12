# Action Late Status Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add granular late status tracking (LATE_TO_START, LATE_TO_FINISH, COMPLETED_LATE) to actions with SQL-based filtering.

**Architecture:** Virtual field calculated in real-time, not persisted. Backward compatible with existing `isLate` boolean filter. Filters translate to SQL WHERE conditions for performance.

**Tech Stack:** NestJS, Prisma, TypeScript, Jest (backend); React, TypeScript, TanStack Query (frontend)

---

## Phase 1: Backend Foundation

### Task 1: Add ActionLateStatus Enum

**Files:**
- Modify: `src/core/domain/shared/enums.ts:40`

**Step 1: Add the new enum**

After the `ActionPriority` enum (line 39), add:

```typescript
export enum ActionLateStatus {
  LATE_TO_START = 'LATE_TO_START',
  LATE_TO_FINISH = 'LATE_TO_FINISH',
  COMPLETED_LATE = 'COMPLETED_LATE',
}
```

**Step 2: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/core/domain/shared/enums.ts
git commit -m "feat: add ActionLateStatus enum

Add three late status types:
- LATE_TO_START: TODO past start date
- LATE_TO_FINISH: IN_PROGRESS past end date
- COMPLETED_LATE: DONE after deadline"
```

---

### Task 2: Add calculateLateStatus Method to Action Entity

**Files:**
- Modify: `src/core/domain/action/action.entity.ts:91-108`
- Create: `src/core/domain/action/__tests__/action.entity.spec.ts`

**Step 1: Write the failing test**

Create test file:

```typescript
import { Action } from '../action.entity';
import { ActionStatus, ActionPriority, ActionLateStatus } from '../../shared/enums';

describe('Action.calculateLateStatus', () => {
  const baseAction = {
    id: 'test-id',
    title: 'Test Action',
    description: 'Test Description',
    priority: ActionPriority.MEDIUM,
    actualStartDate: null,
    actualEndDate: null,
    isLate: false,
    isBlocked: false,
    blockedReason: null,
    companyId: 'company-id',
    teamId: null,
    creatorId: 'creator-id',
    responsibleId: 'responsible-id',
    deletedAt: null,
  };

  describe('LATE_TO_START', () => {
    it('should return LATE_TO_START when TODO and start date passed', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.TODO,
          estimatedStartDate: yesterday,
          estimatedEndDate: tomorrow,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(ActionLateStatus.LATE_TO_START);
    });

    it('should return null when TODO and start date is today', () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.TODO,
          estimatedStartDate: today,
          estimatedEndDate: tomorrow,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(null);
    });

    it('should return null when TODO and start date is future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.TODO,
          estimatedStartDate: tomorrow,
          estimatedEndDate: nextWeek,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(null);
    });
  });

  describe('LATE_TO_FINISH', () => {
    it('should return LATE_TO_FINISH when IN_PROGRESS and end date passed', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.IN_PROGRESS,
          estimatedStartDate: lastWeek,
          estimatedEndDate: yesterday,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(ActionLateStatus.LATE_TO_FINISH);
    });

    it('should return null when IN_PROGRESS and end date is today', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const today = new Date();

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.IN_PROGRESS,
          estimatedStartDate: lastWeek,
          estimatedEndDate: today,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(null);
    });
  });

  describe('COMPLETED_LATE', () => {
    it('should return COMPLETED_LATE when DONE and finished after deadline', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.DONE,
          estimatedStartDate: lastMonth,
          estimatedEndDate: lastWeek,
          actualEndDate: yesterday,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(ActionLateStatus.COMPLETED_LATE);
    });

    it('should return null when DONE and finished on time', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.DONE,
          estimatedStartDate: lastMonth,
          estimatedEndDate: lastWeek,
          actualEndDate: twoWeeksAgo,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(null);
    });

    it('should return null when DONE but no actualEndDate', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const action = new Action(
        ...Object.values({
          ...baseAction,
          status: ActionStatus.DONE,
          estimatedStartDate: lastMonth,
          estimatedEndDate: lastWeek,
          actualEndDate: null,
        })
      );

      const result = action.calculateLateStatus();
      expect(result).toBe(null);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- action.entity.spec.ts`
Expected: FAIL - "calculateLateStatus is not a function"

**Step 3: Add calculateLateStatus method**

In `src/core/domain/action/action.entity.ts`, add after `calculateIsLate()` method (around line 108):

```typescript
public calculateLateStatus(currentDate: Date = new Date()): ActionLateStatus | null {
  // Normalize dates to compare only date part (ignore time)
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const estimatedStart = new Date(this.estimatedStartDate);
  estimatedStart.setHours(0, 0, 0, 0);

  const estimatedEnd = new Date(this.estimatedEndDate);
  estimatedEnd.setHours(0, 0, 0, 0);

  // LATE_TO_START: TODO status and start date has passed (not including today)
  if (this.status === ActionStatus.TODO && today > estimatedStart) {
    return ActionLateStatus.LATE_TO_START;
  }

  // LATE_TO_FINISH: IN_PROGRESS status and end date has passed (not including today)
  if (this.status === ActionStatus.IN_PROGRESS && today > estimatedEnd) {
    return ActionLateStatus.LATE_TO_FINISH;
  }

  // COMPLETED_LATE: DONE status and actually finished after estimated end date
  if (this.status === ActionStatus.DONE && this.actualEndDate) {
    const actualEnd = new Date(this.actualEndDate);
    actualEnd.setHours(0, 0, 0, 0);

    if (actualEnd > estimatedEnd) {
      return ActionLateStatus.COMPLETED_LATE;
    }
  }

  return null;
}
```

Add import at the top:

```typescript
import { ActionPriority, ActionStatus, ActionLateStatus } from '../shared/enums';
```

**Step 4: Run test to verify it passes**

Run: `npm test -- action.entity.spec.ts`
Expected: All tests PASS

**Step 5: Update calculateIsLate to use new method**

Replace the `calculateIsLate()` method:

```typescript
public calculateIsLate(currentDate: Date = new Date()): boolean {
  return this.calculateLateStatus(currentDate) !== null;
}
```

**Step 6: Run all action entity tests**

Run: `npm test -- action.entity`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add src/core/domain/action/
git commit -m "feat: add calculateLateStatus method to Action entity

Implements granular late status calculation:
- LATE_TO_START for TODO past start date
- LATE_TO_FINISH for IN_PROGRESS past end date
- COMPLETED_LATE for DONE finished after deadline

Refactors calculateIsLate to use calculateLateStatus.
Includes comprehensive unit tests."
```

---

### Task 3: Update Repository Interface

**Files:**
- Modify: `src/core/ports/repositories/action.repository.ts`

**Step 1: Add lateStatus to ActionWithChecklistItems interface**

Find the `ActionWithChecklistItems` interface and add:

```typescript
export interface ActionWithChecklistItems {
  action: Action;
  checklistItems: ChecklistItem[];
  kanbanOrder: {
    id: string;
    column: ActionStatus;
    position: number;
    sortOrder: number;
    lastMovedAt: Date;
  } | null;
  responsible?: ActionResponsibleUser;
  lateStatus: ActionLateStatus | null; // NEW
  createdAt: Date;
}
```

Add import at the top:

```typescript
import { ActionStatus, ActionLateStatus } from '../domain/shared/enums';
```

**Step 2: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: Errors in repositories that return ActionWithChecklistItems (we'll fix next)

**Step 3: Commit**

```bash
git add src/core/ports/repositories/action.repository.ts
git commit -m "feat: add lateStatus to ActionWithChecklistItems interface"
```

---

### Task 4: Update Prisma Repository to Calculate lateStatus

**Files:**
- Modify: `src/infra/database/repositories/action.prisma.repository.ts`

**Step 1: Update findByIdWithChecklistItems**

Find the `findByIdWithChecklistItems` method (around line 85) and update the return statement:

```typescript
return {
  action: this.mapToDomain(result),
  checklistItems: result.checklistItems.map((item) =>
    this.mapChecklistItemToDomain(item),
  ),
  kanbanOrder: result.kanbanOrder ?? null,
  responsible: this.mapResponsibleToDto(result.responsible),
  lateStatus: this.mapToDomain(result).calculateLateStatus(), // NEW
  createdAt: result.createdAt,
};
```

**Step 2: Update findByCompanyIdWithChecklistItems**

Find the method (around line 142) and update the return:

```typescript
return results.map((result) => ({
  action: this.mapToDomain(result),
  checklistItems: result.checklistItems.map((item) =>
    this.mapChecklistItemToDomain(item),
  ),
  kanbanOrder: result.kanbanOrder ?? null,
  responsible: this.mapResponsibleToDto(result.responsible),
  lateStatus: this.mapToDomain(result).calculateLateStatus(), // NEW
  createdAt: result.createdAt,
}));
```

**Step 3: Update findByTeamIdWithChecklistItems**

Find the method (around line 195) and update the return:

```typescript
return results.map((result) => ({
  action: this.mapToDomain(result),
  checklistItems: result.checklistItems.map((item) =>
    this.mapChecklistItemToDomain(item),
  ),
  kanbanOrder: result.kanbanOrder ?? null,
  responsible: this.mapResponsibleToDto(result.responsible),
  lateStatus: this.mapToDomain(result).calculateLateStatus(), // NEW
  createdAt: result.createdAt,
}));
```

**Step 4: Update findByResponsibleIdWithChecklistItems**

Find the method (around line 251) and update the return:

```typescript
return results.map((result) => ({
  action: this.mapToDomain(result),
  checklistItems: result.checklistItems.map((item) =>
    this.mapChecklistItemToDomain(item),
  ),
  kanbanOrder: result.kanbanOrder ?? null,
  responsible: this.mapResponsibleToDto(result.responsible),
  lateStatus: this.mapToDomain(result).calculateLateStatus(), // NEW
  createdAt: result.createdAt,
}));
```

**Step 5: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: No errors

**Step 6: Commit**

```bash
git add src/infra/database/repositories/action.prisma.repository.ts
git commit -m "feat: calculate lateStatus in repository methods

Add lateStatus calculation to all methods returning ActionWithChecklistItems."
```

---

### Task 5: Add lateStatus Filter to ListActionsDto

**Files:**
- Modify: `src/api/action/dto/list-actions.dto.ts:1,64`

**Step 1: Add import**

At the top of the file, update imports:

```typescript
import { ActionPriority, ActionStatus, ActionLateStatus } from '@/core/domain/shared/enums';
```

**Step 2: Add lateStatus property**

After the `isLate` property (around line 73), add:

```typescript
@ApiProperty({
  required: false,
  description: 'Filtrar por tipo de atraso específico',
  enum: ActionLateStatus,
  isArray: true,
})
@Transform(({ value }) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return Array.isArray(value) ? value : [value];
})
@IsEnum(ActionLateStatus, { each: true, message: 'Late status inválido' })
@IsOptional()
lateStatus?: ActionLateStatus | ActionLateStatus[];
```

**Step 3: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: No errors (ListActionsService will need updates)

**Step 4: Commit**

```bash
git add src/api/action/dto/list-actions.dto.ts
git commit -m "feat: add lateStatus filter to ListActionsDto

Allows filtering actions by specific late status types."
```

---

### Task 6: Implement lateStatus Filter Logic in ListActionsService

**Files:**
- Modify: `src/application/services/action/list-actions.service.ts`

**Step 1: Add lateStatus to input interface**

Find the `ListActionsInput` interface and add:

```typescript
export interface ListActionsInput {
  // ... existing fields
  isLate?: boolean;
  lateStatus?: ActionLateStatus | ActionLateStatus[]; // NEW
  // ... rest
}
```

Add import at top:

```typescript
import { ActionPriority, ActionStatus, ActionLateStatus } from '@/core/domain/shared/enums';
```

**Step 2: Add SQL filter building method**

Add a private method to build late status WHERE conditions:

```typescript
private buildLateStatusWhere(
  lateStatus: ActionLateStatus | ActionLateStatus[],
): Prisma.ActionWhereInput {
  const statuses = Array.isArray(lateStatus) ? lateStatus : [lateStatus];
  const conditions: Prisma.ActionWhereInput[] = [];

  for (const status of statuses) {
    switch (status) {
      case ActionLateStatus.LATE_TO_START:
        conditions.push({
          status: ActionStatus.TODO,
          estimatedStartDate: { lt: new Date() },
        });
        break;

      case ActionLateStatus.LATE_TO_FINISH:
        conditions.push({
          status: ActionStatus.IN_PROGRESS,
          estimatedEndDate: { lt: new Date() },
        });
        break;

      case ActionLateStatus.COMPLETED_LATE:
        conditions.push({
          status: ActionStatus.DONE,
          AND: [
            { actualEndDate: { not: null } },
            { actualEndDate: { gt: Prisma.sql`"estimatedEndDate"` } },
          ],
        });
        break;
    }
  }

  // Multiple late statuses = OR condition
  return conditions.length === 1 ? conditions[0] : { OR: conditions };
}
```

Add Prisma import at top:

```typescript
import { Prisma } from '@prisma/client';
```

**Step 3: Update execute method to handle lateStatus filter**

Find where filters are built (look for where `isLate` is handled) and add:

```typescript
// Handle lateStatus filter (more specific than isLate)
if (input.lateStatus) {
  const lateStatusWhere = this.buildLateStatusWhere(input.lateStatus);
  Object.assign(where, lateStatusWhere);
} else if (input.isLate !== undefined) {
  // Backward compatibility: isLate=true means any late status
  if (input.isLate) {
    const allLateStatuses = [
      ActionLateStatus.LATE_TO_START,
      ActionLateStatus.LATE_TO_FINISH,
      ActionLateStatus.COMPLETED_LATE,
    ];
    const lateStatusWhere = this.buildLateStatusWhere(allLateStatuses);
    Object.assign(where, lateStatusWhere);
  } else {
    // isLate=false means NOT any late status (invert the OR condition)
    where.AND = [
      {
        NOT: {
          OR: [
            {
              status: ActionStatus.TODO,
              estimatedStartDate: { lt: new Date() },
            },
            {
              status: ActionStatus.IN_PROGRESS,
              estimatedEndDate: { lt: new Date() },
            },
          ],
        },
      },
    ];
  }
}
```

**Step 4: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: No errors

**Step 5: Write integration test**

Create `src/application/services/action/__tests__/list-actions-late-status.service.spec.ts`:

```typescript
// TODO: Add integration test for late status filtering
// This would require setting up test database with test data
// For now, we'll rely on manual testing in development
```

**Step 6: Commit**

```bash
git add src/application/services/action/list-actions.service.ts
git commit -m "feat: implement lateStatus SQL filtering in ListActionsService

Translates lateStatus filter to SQL WHERE conditions.
Maintains backward compatibility with isLate boolean filter."
```

---

### Task 7: Update ActionResponseDto

**Files:**
- Modify: `src/api/action/dto/action-response.dto.ts`

**Step 1: Add lateStatus property**

After the `checklistItems` property (around line 131), add:

```typescript
@ApiProperty({
  description: 'Tipo de atraso da ação (calculado)',
  enum: ActionLateStatus,
  nullable: true,
  example: ActionLateStatus.LATE_TO_FINISH,
})
lateStatus!: ActionLateStatus | null;
```

Add import at top:

```typescript
import { ActionPriority, ActionStatus, ActionLateStatus } from '@/core/domain/shared/enums';
```

**Step 2: Update fromDomain method signature**

Update the method signature (around line 140):

```typescript
static fromDomain(
  action: Action,
  checklistItems?: ChecklistItem[],
  kanbanOrder?: PrismaKanbanOrder | null,
  responsible?: {
    id: string;
    firstName: string;
    lastName: string;
  },
  lateStatus?: ActionLateStatus | null, // NEW parameter
): ActionResponseDto {
```

**Step 3: Add lateStatus to response object**

In the method body, after setting `response.kanbanOrder`:

```typescript
response.lateStatus = lateStatus ?? action.calculateLateStatus();
```

**Step 4: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: Errors in controllers (we'll fix next)

**Step 5: Commit**

```bash
git add src/api/action/dto/action-response.dto.ts
git commit -m "feat: add lateStatus to ActionResponseDto

Add calculated lateStatus field to API response."
```

---

### Task 8: Update ActionController to Pass lateStatus

**Files:**
- Modify: `src/api/action/action.controller.ts`

**Step 1: Update list method**

Find the `list()` method (around line 167) and update the mapping:

```typescript
data: result.results.map((r) =>
  ActionResponseDto.fromDomain(
    r.action,
    r.checklistItems,
    r.kanbanOrder,
    r.responsible,
    r.lateStatus, // NEW parameter
  ),
),
```

**Step 2: Update getById method**

Find the `getById()` method and update:

```typescript
return ActionResponseDto.fromDomain(
  result.result.action,
  result.result.checklistItems,
  result.result.kanbanOrder,
  result.result.responsible,
  result.result.lateStatus, // NEW parameter
);
```

**Step 3: Update update method**

Find the `update()` method (around line 262) and update:

```typescript
return ActionResponseDto.fromDomain(
  result.result.action,
  result.result.checklistItems,
  result.result.kanbanOrder,
  result.result.responsible,
  result.result.lateStatus, // NEW parameter
);
```

**Step 4: Update create method**

Find the `create()` method and check if it needs updating. If it returns just the action without checklist, calculate lateStatus:

```typescript
return ActionResponseDto.fromDomain(
  result.action,
  undefined,
  undefined,
  undefined,
  result.action.calculateLateStatus(), // Calculate since no repository lookup
);
```

**Step 5: Update other methods**

Check `move()`, `delete()`, `block()`, `unblock()` methods. Update any that return ActionResponseDto.

**Step 6: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: No errors

**Step 7: Commit**

```bash
git add src/api/action/action.controller.ts
git commit -m "feat: pass lateStatus to ActionResponseDto in controller

Update all controller methods to include lateStatus in responses."
```

---

### Task 9: Update ActionController to Accept lateStatus Filter

**Files:**
- Modify: `src/api/action/action.controller.ts`

**Step 1: Add ApiQuery decorator for lateStatus**

Find the `list()` method and add the decorator before it:

```typescript
@ApiQuery({
  name: 'lateStatus',
  required: false,
  enum: ActionLateStatus,
  isArray: true,
  description: 'Filtrar por tipo de atraso (pode usar múltiplos: lateStatus=LATE_TO_START&lateStatus=LATE_TO_FINISH)',
})
```

Add import at top:

```typescript
import { ActionLateStatus } from '@/core/domain/shared/enums';
```

**Step 2: Pass lateStatus to service**

In the `list()` method, add to the service call:

```typescript
const result = await this.listActionsService.execute({
  // ... existing params
  isLate: query.isLate,
  lateStatus: query.lateStatus, // NEW
  // ... rest
});
```

**Step 3: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: No errors

**Step 4: Commit**

```bash
git add src/api/action/action.controller.ts
git commit -m "feat: add lateStatus query parameter to list actions endpoint

Expose lateStatus filter in API with Swagger documentation."
```

---

## Phase 2: Frontend Implementation

### Task 10: Add ActionLateStatus Enum to Frontend

**Files:**
- Modify: `tooldo-app/src/lib/types/action.ts:5`

**Step 1: Add enum after ActionPriority**

```typescript
export enum ActionLateStatus {
  LATE_TO_START = 'LATE_TO_START',
  LATE_TO_FINISH = 'LATE_TO_FINISH',
  COMPLETED_LATE = 'COMPLETED_LATE',
}
```

**Step 2: Add lateStatus to Action interface**

In the `Action` interface (around line 44), add:

```typescript
export interface Action {
  // ... existing fields
  checklistItems: ChecklistItem[]
  lateStatus: ActionLateStatus | null  // NEW
  kanbanOrder: KanbanOrder | null
}
```

**Step 3: Add lateStatus to ActionFilters**

In the `ActionFilters` interface (around line 100), add:

```typescript
export interface ActionFilters {
  // ... existing fields
  isLate?: boolean
  lateStatus?: ActionLateStatus | ActionLateStatus[]  // NEW
  // ... rest
}
```

**Step 4: Verify TypeScript compilation**

Run: `cd tooldo-app && npm run typecheck`
Expected: No errors

**Step 5: Commit**

```bash
cd /Users/luanafraga/www/toolDo/tooldo-app
git add src/lib/types/action.ts
git commit -m "feat: add ActionLateStatus enum and lateStatus fields

Add late status type and filters to frontend types."
```

---

### Task 11: Create ActionLateStatusBadge Component

**Files:**
- Create: `tooldo-app/src/components/features/actions/shared/action-late-status-badge.tsx`

**Step 1: Create badge component**

```typescript
import { Badge } from '@/components/ui/badge'
import { ActionLateStatus } from '@/lib/types/action'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface ActionLateStatusBadgeProps {
  lateStatus: ActionLateStatus | null
  size?: 'sm' | 'md'
}

const lateStatusConfig = {
  [ActionLateStatus.LATE_TO_START]: {
    label: 'Atrasada para iniciar',
    icon: Clock,
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  [ActionLateStatus.LATE_TO_FINISH]: {
    label: 'Atrasada para terminar',
    icon: AlertCircle,
    variant: 'default' as const,
    className: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  [ActionLateStatus.COMPLETED_LATE]: {
    label: 'Concluída com atraso',
    icon: CheckCircle,
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
}

export function ActionLateStatusBadge({ lateStatus, size = 'md' }: ActionLateStatusBadgeProps) {
  if (!lateStatus) return null

  const config = lateStatusConfig[lateStatus]
  const Icon = config.icon
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <Badge variant={config.variant} className={`${config.className} ${textSize} gap-1`}>
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  )
}
```

**Step 2: Verify TypeScript compilation**

Run: `npm run typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/features/actions/shared/action-late-status-badge.tsx
git commit -m "feat: add ActionLateStatusBadge component

Create reusable badge component for displaying late status with icons and colors."
```

---

### Task 12: Add Late Status Badge to Action Card

**Files:**
- Modify: `tooldo-app/src/components/features/actions/kanban/action-card.tsx`

**Step 1: Import the badge component**

At the top:

```typescript
import { ActionLateStatusBadge } from '../shared/action-late-status-badge'
```

**Step 2: Add badge to card UI**

Find where action details are displayed (likely near priority/status indicators) and add:

```typescript
{action.lateStatus && (
  <ActionLateStatusBadge lateStatus={action.lateStatus} size="sm" />
)}
```

**Step 3: Test visually**

- Start dev server: `npm run dev`
- Navigate to kanban view
- Verify badge appears for late actions

**Step 4: Commit**

```bash
git add src/components/features/actions/kanban/action-card.tsx
git commit -m "feat: display late status badge on action cards

Show late status indicator on kanban cards."
```

---

### Task 13: Add Late Status Filter to Kanban

**Files:**
- Modify: `tooldo-app/src/components/features/actions/kanban/kanban-filters.tsx` (or wherever filters are)

**Step 1: Add late status filter dropdown**

Find the filters section and add:

```typescript
import { ActionLateStatus } from '@/lib/types/action'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// In the component:
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium">Status de Atraso</label>
  <Select
    value={filters.lateStatus?.[0] ?? 'all'}
    onValueChange={(value) => {
      if (value === 'all') {
        setFilters({ ...filters, lateStatus: undefined })
      } else {
        setFilters({ ...filters, lateStatus: [value as ActionLateStatus] })
      }
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Todos" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos</SelectItem>
      <SelectItem value={ActionLateStatus.LATE_TO_START}>
        Atrasada para iniciar
      </SelectItem>
      <SelectItem value={ActionLateStatus.LATE_TO_FINISH}>
        Atrasada para terminar
      </SelectItem>
      <SelectItem value={ActionLateStatus.COMPLETED_LATE}>
        Concluída com atraso
      </SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Step 2: Update buildActionsApiFilters utility**

Find `tooldo-app/src/lib/utils/build-actions-api-filters.ts` and ensure it handles `lateStatus`:

```typescript
export function buildActionsApiFilters(filters: ActionFilters): ActionFilters {
  const apiFilters: ActionFilters = {}

  // ... existing filters

  if (filters.lateStatus) {
    apiFilters.lateStatus = filters.lateStatus
  }

  return apiFilters
}
```

**Step 3: Test filter functionality**

- Start dev server
- Use late status filter dropdown
- Verify API call includes `lateStatus` parameter
- Verify filtered results display correctly

**Step 4: Commit**

```bash
git add src/components/features/actions/kanban/kanban-filters.tsx
git add src/lib/utils/build-actions-api-filters.ts
git commit -m "feat: add late status filter to kanban

Add dropdown to filter actions by late status type."
```

---

## Phase 3: Testing & Documentation

### Task 14: Manual End-to-End Testing

**Files:**
- None (testing only)

**Step 1: Test LATE_TO_START**

1. Create action with start date = yesterday, status = TODO
2. Verify API returns `lateStatus: "LATE_TO_START"`
3. Verify badge shows "Atrasada para iniciar" in red
4. Verify filter works

**Step 2: Test LATE_TO_FINISH**

1. Create action with end date = yesterday, status = IN_PROGRESS
2. Verify API returns `lateStatus: "LATE_TO_FINISH"`
3. Verify badge shows "Atrasada para terminar" in orange
4. Verify filter works

**Step 3: Test COMPLETED_LATE**

1. Create action with end date = last week
2. Complete it (move to DONE) - sets actualEndDate = today
3. Verify API returns `lateStatus: "COMPLETED_LATE"`
4. Verify badge shows "Concluída com atraso" in yellow
5. Verify filter works

**Step 4: Test backward compatibility**

1. Use old filter: `?isLate=true`
2. Verify it returns all three types of late actions
3. Verify `?isLate=false` returns only on-time actions

**Step 5: Test edge cases**

- Action with start date = today (should be null)
- Action with end date = today (should be null)
- Action DONE on time (should be null)
- Action DONE with no actualEndDate (should be null)

**Step 6: Document test results**

Create `docs/testing/2026-01-11-late-status-manual-tests.md` with results.

**Step 7: Commit test documentation**

```bash
git add docs/testing/
git commit -m "docs: add manual test results for late status feature"
```

---

### Task 15: Update API Documentation

**Files:**
- Create: `docs/api/late-status-filtering.md`

**Step 1: Write API documentation**

```markdown
# Late Status Filtering

## Overview

Actions can have granular late status tracking: LATE_TO_START, LATE_TO_FINISH, or COMPLETED_LATE.

## Query Parameters

### lateStatus

Filter actions by specific late status type(s).

**Type:** `ActionLateStatus | ActionLateStatus[]`

**Values:**
- `LATE_TO_START` - Action in TODO status past estimated start date
- `LATE_TO_FINISH` - Action in IN_PROGRESS status past estimated end date
- `COMPLETED_LATE` - Action in DONE status that finished after deadline

**Examples:**

```
GET /api/v1/actions?lateStatus=LATE_TO_START
GET /api/v1/actions?lateStatus=LATE_TO_START&lateStatus=LATE_TO_FINISH
```

### isLate (backward compatible)

Filter actions by any late status.

**Type:** `boolean`

**Examples:**

```
GET /api/v1/actions?isLate=true  // Returns all late actions
GET /api/v1/actions?isLate=false // Returns only on-time actions
```

## Response

All action responses include calculated `lateStatus` field:

```json
{
  "id": "...",
  "title": "Action Title",
  "status": "TODO",
  "estimatedStartDate": "2026-01-05T00:00:00Z",
  "lateStatus": "LATE_TO_START",
  ...
}
```

**Note:** `lateStatus` is calculated in real-time, not stored in database.
```

**Step 2: Commit documentation**

```bash
git add docs/api/late-status-filtering.md
git commit -m "docs: add API documentation for late status filtering"
```

---

## Summary

**Total Tasks:** 15
**Estimated Time:** 3-4 hours
**Key Changes:**
- Backend: Enum, entity method, repository, service, controller, DTOs
- Frontend: Types, badge component, kanban integration, filters
- Testing: Manual E2E tests
- Documentation: API docs

**Tech Stack:**
- Backend: NestJS, Prisma, TypeScript, Jest
- Frontend: React, TypeScript, TanStack Query, Tailwind

**Testing Strategy:**
- Unit tests for entity logic
- Manual E2E tests for full flow
- TypeScript compilation checks at each step

**Deployment Notes:**
- No database migration required (virtual field)
- Backward compatible with existing `isLate` filter
- Can deploy backend and frontend independently

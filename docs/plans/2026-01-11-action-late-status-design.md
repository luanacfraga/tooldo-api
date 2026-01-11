# Action Late Status System Design

**Date:** 2026-01-11
**Status:** Approved
**Author:** Claude + Luana Fraga

## Overview

Add granular visibility into different types of action delays, enabling specific filters and more precise metrics.

## Problem Statement

Current system has a simple `isLate` boolean that only checks if the end date has passed. This doesn't distinguish between:
- Actions late to start (TODO past start date)
- Actions late to finish (IN_PROGRESS past end date)
- Actions completed late (DONE but finished after deadline)

Users need to filter and track these separately for better project management.

## Solution

### 1. New Enum: ActionLateStatus

Three possible values:
- `LATE_TO_START` - Action in TODO with estimated start date already passed
- `LATE_TO_FINISH` - Action in IN_PROGRESS with estimated end date already passed
- `COMPLETED_LATE` - Action in DONE that finished after estimated end date

### 2. Implementation Strategy

**Virtual Field (Not Persisted)**
- `lateStatus: ActionLateStatus | null` - calculated field, not stored in database
- `isLate: boolean` - maintained for backward compatibility, calculated as `lateStatus !== null`

**Why virtual?**
- Always accurate (no need for cron jobs)
- No data migration required
- Simpler implementation
- Filter via SQL calculations

## Business Rules

```typescript
if (status === TODO && today > estimatedStartDate) {
  lateStatus = LATE_TO_START
}

if (status === IN_PROGRESS && today > estimatedEndDate) {
  lateStatus = LATE_TO_FINISH
}

if (status === DONE && actualEndDate > estimatedEndDate) {
  lateStatus = COMPLETED_LATE
}

// Otherwise
lateStatus = null
```

**Date Comparison:**
- All comparisons use date-only (ignore time)
- "today > estimatedStartDate" means start date has passed (not equal)

## Backend Implementation

### 1. Enum Definition

**File:** `tooldo-api/src/core/domain/shared/enums.ts`

```typescript
export enum ActionLateStatus {
  LATE_TO_START = 'LATE_TO_START',
  LATE_TO_FINISH = 'LATE_TO_FINISH',
  COMPLETED_LATE = 'COMPLETED_LATE',
}
```

### 2. Entity Methods

**File:** `tooldo-api/src/core/domain/action/action.entity.ts`

Add new method:
```typescript
public calculateLateStatus(currentDate: Date = new Date()): ActionLateStatus | null {
  const today = new Date(currentDate.setHours(0, 0, 0, 0));
  const estimatedStart = new Date(this.estimatedStartDate.setHours(0, 0, 0, 0));
  const estimatedEnd = new Date(this.estimatedEndDate.setHours(0, 0, 0, 0));

  if (this.status === ActionStatus.TODO && today > estimatedStart) {
    return ActionLateStatus.LATE_TO_START;
  }

  if (this.status === ActionStatus.IN_PROGRESS && today > estimatedEnd) {
    return ActionLateStatus.LATE_TO_FINISH;
  }

  if (this.status === ActionStatus.DONE && this.actualEndDate) {
    const actualEnd = new Date(this.actualEndDate.setHours(0, 0, 0, 0));
    if (actualEnd > estimatedEnd) {
      return ActionLateStatus.COMPLETED_LATE;
    }
  }

  return null;
}
```

Update existing method:
```typescript
public calculateIsLate(currentDate: Date = new Date()): boolean {
  return this.calculateLateStatus(currentDate) !== null;
}
```

### 3. Repository Changes

**File:** `tooldo-api/src/core/ports/repositories/action.repository.ts`

Update interface:
```typescript
export interface ActionWithChecklistItems {
  action: Action;
  checklistItems: ChecklistItem[];
  kanbanOrder: { /* ... */ } | null;
  responsible?: ActionResponsibleUser;
  lateStatus: ActionLateStatus | null; // NEW
  createdAt: Date;
}
```

**File:** `tooldo-api/src/infra/database/repositories/action.prisma.repository.ts`

Calculate `lateStatus` when returning data:
```typescript
return results.map((result) => ({
  action: this.mapToDomain(result),
  checklistItems: result.checklistItems.map(item => this.mapChecklistItemToDomain(item)),
  kanbanOrder: result.kanbanOrder ?? null,
  responsible: this.mapResponsibleToDto(result.responsible),
  lateStatus: this.mapToDomain(result).calculateLateStatus(), // NEW
  createdAt: result.createdAt,
}));
```

### 4. API Filtering

**File:** `tooldo-api/src/api/action/dto/list-actions.dto.ts`

Add new filter:
```typescript
@ApiQuery({
  name: 'lateStatus',
  required: false,
  enum: ActionLateStatus,
  isArray: true,
  description: 'Filter by late status type',
})
@IsOptional()
@IsEnum(ActionLateStatus, { each: true })
lateStatus?: ActionLateStatus | ActionLateStatus[];
```

**Backward Compatibility:**
- Keep `isLate?: boolean` filter working
- `isLate=true` returns actions with any late status
- New `lateStatus` filter allows specific filtering

**SQL Translation:**

```typescript
// lateStatus=LATE_TO_START
WHERE status = 'TODO' AND "estimatedStartDate" < CURRENT_DATE

// lateStatus=LATE_TO_FINISH
WHERE status = 'IN_PROGRESS' AND "estimatedEndDate" < CURRENT_DATE

// lateStatus=COMPLETED_LATE
WHERE status = 'DONE' AND "actualEndDate" > "estimatedEndDate"

// Multiple values (OR condition)
WHERE (
  (status = 'TODO' AND "estimatedStartDate" < CURRENT_DATE) OR
  (status = 'IN_PROGRESS' AND "estimatedEndDate" < CURRENT_DATE)
)
```

### 5. Response DTO

**File:** `tooldo-api/src/api/action/dto/action-response.dto.ts`

Add field:
```typescript
@ApiProperty({
  description: 'Late status type',
  enum: ActionLateStatus,
  nullable: true,
  example: ActionLateStatus.LATE_TO_FINISH,
})
lateStatus!: ActionLateStatus | null;
```

Update `fromDomain` method:
```typescript
static fromDomain(
  action: Action,
  checklistItems?: ChecklistItem[],
  kanbanOrder?: PrismaKanbanOrder | null,
  responsible?: { /* ... */ },
  lateStatus?: ActionLateStatus | null, // NEW parameter
): ActionResponseDto {
  const response = new ActionResponseDto();
  // ... existing fields
  response.lateStatus = lateStatus ?? action.calculateLateStatus();
  return response;
}
```

## Frontend Implementation

### 1. Type Definitions

**File:** `tooldo-app/src/lib/types/action.ts`

Add enum:
```typescript
export enum ActionLateStatus {
  LATE_TO_START = 'LATE_TO_START',
  LATE_TO_FINISH = 'LATE_TO_FINISH',
  COMPLETED_LATE = 'COMPLETED_LATE',
}
```

Update interface:
```typescript
export interface Action {
  // ... existing fields
  lateStatus: ActionLateStatus | null;
}

export interface ActionFilters {
  // ... existing fields
  lateStatus?: ActionLateStatus | ActionLateStatus[];
}
```

### 2. UI Components

**New Component:** `tooldo-app/src/components/features/actions/shared/action-late-status-badge.tsx`

Display badges:
- 🔴 "Atrasada para iniciar" (LATE_TO_START) - red
- 🟠 "Atrasada para terminar" (LATE_TO_FINISH) - orange
- 🟡 "Concluída com atraso" (COMPLETED_LATE) - yellow

**Kanban Filter:**
Add dropdown "Status de atraso" with options:
- Todas
- Atrasada para iniciar
- Atrasada para terminar
- Concluída com atraso

## Migration Strategy

### Phase 1: Backend
1. Add enum to backend
2. Add `calculateLateStatus()` method
3. Update repository to calculate and return `lateStatus`
4. Add API filter support
5. Update response DTOs

### Phase 2: Frontend
1. Add enum to frontend types
2. Update Action interface
3. Create badge component
4. Add filter to kanban
5. Display badges in action cards

### Phase 3: Testing
1. Unit tests for `calculateLateStatus()` logic
2. Integration tests for API filters
3. E2E tests for kanban filtering

## Success Metrics

- Users can filter actions by specific late status
- Dashboards show separate counts for each late type
- No performance degradation (calculations are cheap)
- Backward compatibility maintained (`isLate` still works)

## Future Enhancements

Possible additions (not in this phase):
- `STARTING_SOON` - 1-2 days before start date
- `DEADLINE_APPROACHING` - 1-2 days before end date
- Notifications/alerts based on late status
- Late status history/timeline

# Kanban Ordering and History Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add position tracking, reordering, and movement history to the Kanban board actions system.

**Architecture:** Create separate `KanbanOrder` and `ActionMovement` models to track action positions within columns and maintain a complete audit trail of movements. Update the `moveAction` service to handle reordering and automatic timestamp updates.

**Tech Stack:**
- Backend: NestJS, Prisma ORM, PostgreSQL
- Frontend: Next.js, React Query, @dnd-kit, TypeScript

---

## Task 1: Create Backend Schema Models

**Files:**
- Modify: `tooldo-api/prisma/schema.prisma`

**Step 1: Add KanbanColumn enum**

Add after the ActionStatus enum:

```prisma
enum KanbanColumn {
  TODO
  IN_PROGRESS
  DONE
}
```

**Step 2: Add KanbanOrder model**

Add after the Action model:

```prisma
model KanbanOrder {
  id          String       @id @default(uuid())
  column      KanbanColumn
  position    Int
  sortOrder   Int          @default(0)
  lastMovedAt DateTime     @default(now())
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  actionId    String       @unique
  action      Action       @relation(fields: [actionId], references: [id], onDelete: Cascade)

  @@index([column, position])
  @@index([column, sortOrder])
  @@index([column, lastMovedAt])
}
```

**Step 3: Add ActionMovement model**

Add after KanbanOrder:

```prisma
model ActionMovement {
  id          String       @id @default(uuid())
  fromColumn  KanbanColumn
  toColumn    KanbanColumn
  timeSpent   Int?         // seconds spent in previous column
  movedAt     DateTime     @default(now())

  actionId    String
  action      Action       @relation(fields: [actionId], references: [id], onDelete: Cascade)

  movedById   String
  movedBy     User         @relation(fields: [movedById], references: [id])

  @@index([actionId])
  @@index([movedById])
  @@index([movedAt])
}
```

**Step 4: Update Action model**

Add these relations to the Action model:

```prisma
model Action {
  // ... existing fields ...

  actualStartDate DateTime?
  actualEndDate   DateTime?

  // ... existing relations ...

  kanbanOrder     KanbanOrder?
  movements       ActionMovement[]
}
```

**Step 5: Update User model**

Add this relation to the User model:

```prisma
model User {
  // ... existing fields ...

  movedActions ActionMovement[]
}
```

**Step 6: Commit schema changes**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add KanbanOrder and ActionMovement models"
```

---

## Task 2: Generate and Run Migration

**Files:**
- Create: `tooldo-api/prisma/migrations/YYYYMMDDHHMMSS_add_kanban_ordering/migration.sql` (auto-generated)

**Step 1: Generate migration**

```bash
cd tooldo-api
npx prisma migrate dev --name add_kanban_ordering
```

Expected: Migration file created

**Step 2: Verify migration**

Check that the migration file contains:
- CREATE TABLE "KanbanOrder"
- CREATE TABLE "ActionMovement"
- ALTER TABLE "Action" ADD COLUMN "actualStartDate"
- ALTER TABLE "Action" ADD COLUMN "actualEndDate"
- CREATE INDEX on kanbanOrder columns

**Step 3: Create data migration script**

Create: `tooldo-api/prisma/migrations/YYYYMMDDHHMMSS_add_kanban_ordering/data-migration.ts`

```typescript
import { PrismaClient, ActionStatus, KanbanColumn } from '@prisma/client';

const prisma = new PrismaClient();

const statusToColumn: Record<ActionStatus, KanbanColumn> = {
  TODO: KanbanColumn.TODO,
  IN_PROGRESS: KanbanColumn.IN_PROGRESS,
  DONE: KanbanColumn.DONE,
};

async function main() {
  console.log('Migrating existing actions to KanbanOrder...');

  const actions = await prisma.action.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const columnPositions: Record<KanbanColumn, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };

  for (const action of actions) {
    const column = statusToColumn[action.status];
    const position = columnPositions[column];

    await prisma.kanbanOrder.create({
      data: {
        actionId: action.id,
        column,
        position,
        sortOrder: position,
        lastMovedAt: action.updatedAt,
      },
    });

    columnPositions[column]++;
  }

  console.log(`Migrated ${actions.length} actions to KanbanOrder`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 4: Run data migration**

```bash
npx ts-node prisma/migrations/YYYYMMDDHHMMSS_add_kanban_ordering/data-migration.ts
```

Expected: All existing actions migrated to KanbanOrder

**Step 5: Commit migration**

```bash
git add prisma/migrations/
git commit -m "feat(db): migrate existing actions to KanbanOrder"
```

---

## Task 3: Update Backend DTOs

**Files:**
- Create: `tooldo-api/src/api/action/dto/move-action.dto.ts`
- Modify: `tooldo-api/src/api/action/dto/action-response.dto.ts`

**Step 1: Update MoveActionDto**

Modify `tooldo-api/src/api/action/dto/move-action.dto.ts`:

```typescript
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ActionStatus } from '@/core/domain/shared/enums';

export class MoveActionDto {
  @IsEnum(ActionStatus)
  toStatus: ActionStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

**Step 2: Create KanbanOrderResponseDto**

Create: `tooldo-api/src/api/action/dto/kanban-order-response.dto.ts`

```typescript
import { KanbanColumn } from '@prisma/client';

export class KanbanOrderResponseDto {
  id: string;
  column: KanbanColumn;
  position: number;
  sortOrder: number;
  lastMovedAt: Date;

  static fromEntity(kanbanOrder: any): KanbanOrderResponseDto {
    return {
      id: kanbanOrder.id,
      column: kanbanOrder.column,
      position: kanbanOrder.position,
      sortOrder: kanbanOrder.sortOrder,
      lastMovedAt: kanbanOrder.lastMovedAt,
    };
  }
}
```

**Step 3: Update ActionResponseDto**

Modify `tooldo-api/src/api/action/dto/action-response.dto.ts` to include kanbanOrder:

```typescript
import { KanbanOrderResponseDto } from './kanban-order-response.dto';

export class ActionResponseDto {
  // ... existing fields ...

  actualStartDate: Date | null;
  actualEndDate: Date | null;
  kanbanOrder: KanbanOrderResponseDto | null;

  static fromDomain(action: Action, checklistItems?: ChecklistItem[]): ActionResponseDto {
    return {
      // ... existing fields ...
      actualStartDate: action.actualStartDate,
      actualEndDate: action.actualEndDate,
      kanbanOrder: action.kanbanOrder
        ? KanbanOrderResponseDto.fromEntity(action.kanbanOrder)
        : null,
      // ... rest of mapping ...
    };
  }
}
```

**Step 4: Commit DTO changes**

```bash
git add src/api/action/dto/
git commit -m "feat(dto): add position to MoveActionDto and kanbanOrder to response"
```

---

## Task 4: Update CreateActionService

**Files:**
- Modify: `tooldo-api/src/application/services/action/create-action.service.ts`

**Step 1: Import KanbanColumn**

Add to imports:

```typescript
import { KanbanColumn } from '@prisma/client';
```

**Step 2: Update execute method to create KanbanOrder**

Replace the action creation part with:

```typescript
async execute(input: CreateActionInput): Promise<CreateActionOutput> {
  await this.validateInput(input);

  // Get last position in TODO column
  const lastKanbanOrder = await this.actionRepository.findLastKanbanOrderInColumn(
    KanbanColumn.TODO
  );
  const nextPosition = (lastKanbanOrder?.position ?? -1) + 1;

  const action = new Action(
    randomUUID(),
    input.title,
    input.description,
    ActionStatus.TODO,
    input.priority,
    input.estimatedStartDate,
    input.estimatedEndDate,
    null, // actualStartDate
    null, // actualEndDate
    false,
    false,
    null,
    input.companyId,
    input.teamId ?? null,
    input.creatorId,
    input.responsibleId,
    null,
  );

  // Create action with kanbanOrder
  const created = await this.actionRepository.createWithKanbanOrder(
    action,
    KanbanColumn.TODO,
    nextPosition
  );

  return {
    action: created,
  };
}
```

**Step 3: Commit service update**

```bash
git add src/application/services/action/create-action.service.ts
git commit -m "feat(service): create actions with KanbanOrder"
```

---

## Task 5: Update ActionRepository

**Files:**
- Modify: `tooldo-api/src/core/ports/repositories/action.repository.ts`
- Modify: `tooldo-api/src/infra/database/repositories/action.prisma.repository.ts`

**Step 1: Add methods to repository interface**

Add to `tooldo-api/src/core/ports/repositories/action.repository.ts`:

```typescript
import { KanbanColumn } from '@prisma/client';

export interface ActionRepository {
  // ... existing methods ...

  findLastKanbanOrderInColumn(column: KanbanColumn): Promise<{ position: number } | null>;
  createWithKanbanOrder(action: Action, column: KanbanColumn, position: number): Promise<Action>;
  updateActionsPositionInColumn(column: KanbanColumn, fromPosition: number, increment: number): Promise<void>;
}
```

**Step 2: Implement in Prisma repository**

Add to `tooldo-api/src/infra/database/repositories/action.prisma.repository.ts`:

```typescript
async findLastKanbanOrderInColumn(column: KanbanColumn): Promise<{ position: number } | null> {
  return this.prisma.kanbanOrder.findFirst({
    where: { column },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
}

async createWithKanbanOrder(action: Action, column: KanbanColumn, position: number): Promise<Action> {
  const created = await this.prisma.action.create({
    data: {
      id: action.id,
      title: action.title,
      description: action.description,
      status: action.status,
      priority: action.priority,
      estimatedStartDate: action.estimatedStartDate,
      estimatedEndDate: action.estimatedEndDate,
      actualStartDate: action.actualStartDate,
      actualEndDate: action.actualEndDate,
      isLate: action.isLate,
      isBlocked: action.isBlocked,
      blockedReason: action.blockedReason,
      companyId: action.companyId,
      teamId: action.teamId,
      creatorId: action.creatorId,
      responsibleId: action.responsibleId,
      deletedAt: action.deletedAt,
      kanbanOrder: {
        create: {
          column,
          position,
          sortOrder: position,
        },
      },
    },
    include: {
      kanbanOrder: true,
    },
  });

  return PrismaActionMapper.toDomain(created);
}

async updateActionsPositionInColumn(
  column: KanbanColumn,
  fromPosition: number,
  increment: number
): Promise<void> {
  await this.prisma.kanbanOrder.updateMany({
    where: {
      column,
      position: { gte: fromPosition },
    },
    data: {
      position: { increment },
      sortOrder: { increment },
    },
  });
}
```

**Step 3: Update findByCompanyIdWithChecklistItems to include kanbanOrder**

Modify the include in existing methods:

```typescript
include: {
  kanbanOrder: true,
  checklistItems: {
    orderBy: { createdAt: 'asc' },
  },
}
```

**Step 4: Commit repository changes**

```bash
git add src/core/ports/repositories/action.repository.ts src/infra/database/repositories/action.prisma.repository.ts
git commit -m "feat(repository): add KanbanOrder support"
```

---

## Task 6: Create MoveActionService with Reordering

**Files:**
- Modify: `tooldo-api/src/application/services/action/move-action.service.ts`

**Step 1: Import necessary types**

```typescript
import { KanbanColumn } from '@prisma/client';
import { ActionRepository } from '@/core/ports/repositories/action.repository';
import { ActionMovementRepository } from '@/core/ports/repositories/action-movement.repository';
```

**Step 2: Update MoveActionInput**

```typescript
export interface MoveActionInput {
  actionId: string;
  toStatus: ActionStatus;
  position?: number;
  movedById: string;
  notes?: string;
}
```

**Step 3: Implement reordering logic**

Replace the execute method:

```typescript
async execute(input: MoveActionInput): Promise<MoveActionOutput> {
  const action = await this.actionRepository.findById(input.actionId);
  if (!action) {
    throw new EntityNotFoundException('Ação', input.actionId);
  }

  // Map ActionStatus to KanbanColumn
  const statusToColumn: Record<ActionStatus, KanbanColumn> = {
    TODO: KanbanColumn.TODO,
    IN_PROGRESS: KanbanColumn.IN_PROGRESS,
    DONE: KanbanColumn.DONE,
  };

  const toColumn = statusToColumn[input.toStatus];
  const fromColumn = statusToColumn[action.status];

  // Get current kanbanOrder
  const currentKanbanOrder = await this.actionRepository.findKanbanOrderByActionId(
    input.actionId
  );

  if (!currentKanbanOrder) {
    throw new EntityNotFoundException('KanbanOrder', input.actionId);
  }

  // Calculate time spent in previous column
  const timeSpent = currentKanbanOrder.lastMovedAt
    ? Math.floor((Date.now() - currentKanbanOrder.lastMovedAt.getTime()) / 1000)
    : null;

  // Register movement
  await this.actionMovementRepository.create({
    actionId: input.actionId,
    fromColumn,
    toColumn,
    movedById: input.movedById,
    timeSpent,
  });

  // Determine new position
  let newPosition = input.position;
  if (newPosition === undefined) {
    const lastOrder = await this.actionRepository.findLastKanbanOrderInColumn(toColumn);
    newPosition = (lastOrder?.position ?? -1) + 1;
  }

  // Reorder actions in destination column
  if (toColumn !== fromColumn || newPosition > currentKanbanOrder.position) {
    await this.actionRepository.updateActionsPositionInColumn(
      toColumn,
      newPosition,
      1
    );
  }

  // Update action
  const actualStartDate =
    toColumn === KanbanColumn.IN_PROGRESS && !action.actualStartDate
      ? new Date()
      : action.actualStartDate;

  const actualEndDate =
    toColumn === KanbanColumn.DONE && !action.actualEndDate
      ? new Date()
      : action.actualEndDate;

  const updatedAction = new Action(
    action.id,
    action.title,
    action.description,
    input.toStatus,
    action.priority,
    action.estimatedStartDate,
    action.estimatedEndDate,
    actualStartDate,
    actualEndDate,
    action.isLate,
    action.isBlocked,
    action.blockedReason,
    action.companyId,
    action.teamId,
    action.creatorId,
    action.responsibleId,
    action.deletedAt,
  );

  const updated = await this.actionRepository.updateWithKanbanOrder(
    updatedAction,
    toColumn,
    newPosition
  );

  return {
    action: updated,
  };
}
```

**Step 4: Commit service**

```bash
git add src/application/services/action/move-action.service.ts
git commit -m "feat(service): implement reordering in moveAction"
```

---

## Task 7: Create ActionMovementRepository

**Files:**
- Create: `tooldo-api/src/core/ports/repositories/action-movement.repository.ts`
- Create: `tooldo-api/src/infra/database/repositories/action-movement.prisma.repository.ts`

**Step 1: Create port interface**

Create `tooldo-api/src/core/ports/repositories/action-movement.repository.ts`:

```typescript
import { KanbanColumn } from '@prisma/client';

export interface CreateActionMovementData {
  actionId: string;
  fromColumn: KanbanColumn;
  toColumn: KanbanColumn;
  movedById: string;
  timeSpent: number | null;
}

export interface ActionMovement {
  id: string;
  actionId: string;
  fromColumn: KanbanColumn;
  toColumn: KanbanColumn;
  movedById: string;
  timeSpent: number | null;
  movedAt: Date;
}

export interface ActionMovementRepository {
  create(data: CreateActionMovementData): Promise<ActionMovement>;
  findByActionId(actionId: string): Promise<ActionMovement[]>;
}
```

**Step 2: Implement Prisma repository**

Create `tooldo-api/src/infra/database/repositories/action-movement.prisma.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActionMovement,
  ActionMovementRepository,
  CreateActionMovementData,
} from '@/core/ports/repositories/action-movement.repository';

@Injectable()
export class ActionMovementPrismaRepository implements ActionMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateActionMovementData): Promise<ActionMovement> {
    return this.prisma.actionMovement.create({
      data: {
        actionId: data.actionId,
        fromColumn: data.fromColumn,
        toColumn: data.toColumn,
        movedById: data.movedById,
        timeSpent: data.timeSpent,
      },
    });
  }

  async findByActionId(actionId: string): Promise<ActionMovement[]> {
    return this.prisma.actionMovement.findMany({
      where: { actionId },
      orderBy: { movedAt: 'desc' },
    });
  }
}
```

**Step 3: Register in module**

Add to `tooldo-api/src/infra/database/database.module.ts`:

```typescript
import { ActionMovementPrismaRepository } from './repositories/action-movement.prisma.repository';

@Module({
  providers: [
    // ... existing providers ...
    {
      provide: 'ActionMovementRepository',
      useClass: ActionMovementPrismaRepository,
    },
  ],
  exports: [
    // ... existing exports ...
    'ActionMovementRepository',
  ],
})
export class DatabaseModule {}
```

**Step 4: Commit repository**

```bash
git add src/core/ports/repositories/action-movement.repository.ts src/infra/database/repositories/action-movement.prisma.repository.ts src/infra/database/database.module.ts
git commit -m "feat(repository): add ActionMovement repository"
```

---

## Task 8: Update Action Controller

**Files:**
- Modify: `tooldo-api/src/api/action/action.controller.ts`

**Step 1: Update move endpoint**

Modify the move method to accept position:

```typescript
@Patch(':id/move')
@HttpCode(HttpStatus.OK)
@ApiOperation({
  summary: 'Mover ação no kanban',
  description: 'Move a ação para um novo status e posição, registrando o movimento',
})
@ApiOkResponse({
  description: 'Ação movida com sucesso',
  type: ActionResponseDto,
})
@ApiBadRequestResponse({ description: 'Dados inválidos' })
@ApiNotFoundResponse({ description: 'Ação não encontrada' })
async move(
  @Param('id') id: string,
  @Body() dto: MoveActionDto,
  @Request() req: RequestWithUser,
): Promise<ActionResponseDto> {
  const result = await this.moveActionService.execute({
    actionId: id,
    toStatus: dto.toStatus,
    position: dto.position,
    movedById: req.user.sub,
    notes: dto.notes,
  });
  return ActionResponseDto.fromDomain(result.action);
}
```

**Step 2: Update list endpoint to include kanbanOrder**

Ensure the list method returns actions with kanbanOrder included.

**Step 3: Commit controller changes**

```bash
git add src/api/action/action.controller.ts
git commit -m "feat(controller): add position parameter to move endpoint"
```

---

## Task 9: Update Frontend Types

**Files:**
- Modify: `tooldo-app/src/lib/types/action.ts`

**Step 1: Add KanbanColumn enum**

```typescript
export enum KanbanColumn {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
```

**Step 2: Add KanbanOrder type**

```typescript
export interface KanbanOrder {
  id: string;
  column: KanbanColumn;
  position: number;
  sortOrder: number;
  lastMovedAt: string;
}
```

**Step 3: Update Action interface**

```typescript
export interface Action {
  // ... existing fields ...
  actualStartDate: string | null;
  actualEndDate: string | null;
  kanbanOrder: KanbanOrder | null;
  checklistItems?: ChecklistItem[];
}
```

**Step 4: Update MoveActionDto**

```typescript
export interface MoveActionDto {
  toStatus: ActionStatus;
  position?: number;
  notes?: string;
}
```

**Step 5: Commit type changes**

```bash
git add src/lib/types/action.ts
git commit -m "feat(types): add KanbanOrder and position types"
```

---

## Task 10: Update API Client

**Files:**
- Modify: `tooldo-app/src/lib/api/endpoints/actions.ts`

**Step 1: Update move method**

```typescript
/**
 * Move action to new status and position
 */
move: (id: string, data: MoveActionDto): Promise<Action> => {
  return apiClient.patch<Action>(`/api/v1/actions/${id}/move`, data);
},
```

**Step 2: Commit API changes**

```bash
git add src/lib/api/endpoints/actions.ts
git commit -m "feat(api): update move endpoint to support position"
```

---

## Task 11: Create useKanbanActions Hook

**Files:**
- Create: `tooldo-app/src/lib/hooks/use-kanban-actions.ts`

**Step 1: Create hook with sensors**

```typescript
import { useMemo, useState, useCallback } from 'react';
import {
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useActions, useMoveAction } from './use-actions';
import type { Action, ActionFilters, ActionStatus } from '@/lib/types/action';
import { toast } from 'sonner';

export function useKanbanActions(filters: ActionFilters) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const moveAction = useMoveAction();

  // Configure sensors with constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        tolerance: 5,
        delay: 50,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const { data: actions = [], isLoading, error } = useActions(filters);

  const getColumnActions = useCallback(
    (status: ActionStatus) => {
      return actions
        .filter((action) => action.status === status)
        .sort((a, b) => {
          const aPos = a.kanbanOrder?.position ?? 0;
          const bPos = b.kanbanOrder?.position ?? 0;
          return aPos - bPos;
        });
    },
    [actions]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id as string);

      const draggedAction = actions.find((action) => action.id === active.id);
      if (draggedAction) {
        setActiveAction(draggedAction);
      }
    },
    [actions]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveAction(null);

      if (!over) return;

      const activeAction = actions.find((action) => action.id === active.id);
      if (!activeAction) return;

      // Determine new status from over.id (column id or action id)
      const isColumn = ['TODO', 'IN_PROGRESS', 'DONE'].includes(over.id as string);
      const newStatus = isColumn
        ? (over.id as ActionStatus)
        : actions.find((a) => a.id === over.id)?.status;

      if (!newStatus) return;

      // Calculate new position
      const columnActions = actions.filter((a) => a.status === newStatus);
      let newPosition = columnActions.length;

      if (!isColumn) {
        const overIndex = columnActions.findIndex((a) => a.id === over.id);
        if (overIndex !== -1) {
          newPosition = overIndex;
        }
      }

      // Don't move if same position
      if (
        activeAction.status === newStatus &&
        activeAction.kanbanOrder?.position === newPosition
      ) {
        return;
      }

      try {
        await moveAction.mutateAsync({
          id: activeAction.id,
          data: {
            toStatus: newStatus,
            position: newPosition,
          },
        });
        toast.success('Ação movida com sucesso');
      } catch (error) {
        toast.error('Erro ao mover ação');
      }
    },
    [actions, moveAction]
  );

  return {
    actions,
    isLoading,
    error,
    getColumnActions,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
    activeAction,
  };
}
```

**Step 2: Commit hook**

```bash
git add src/lib/hooks/use-kanban-actions.ts
git commit -m "feat(hooks): create useKanbanActions with position support"
```

---

## Task 12: Update KanbanColumn Component

**Files:**
- Modify: `tooldo-app/src/components/features/actions/action-list/action-kanban-board.tsx`

**Step 1: Update imports**

Replace imports with:

```typescript
import { useKanbanActions } from '@/lib/hooks/use-kanban-actions';
import {
  closestCenter,
  DragOverlay,
} from '@dnd-kit/core';
```

**Step 2: Replace ActionKanbanBoard with new implementation**

```typescript
export function ActionKanbanBoard() {
  const { selectedCompany } = useCompany();
  const filtersState = useActionFiltersStore();
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Build API filters from store
  const apiFilters: ActionFilters = useMemo(() => {
    const filters: ActionFilters = {};

    if (filtersState.status !== 'all') filters.status = filtersState.status;
    if (filtersState.priority !== 'all') filters.priority = filtersState.priority;
    if (filtersState.showBlockedOnly) filters.isBlocked = true;
    if (filtersState.showLateOnly) filters.isLate = true;

    if (filtersState.assignment === 'assigned-to-me') {
      filters.responsibleId = user?.id;
    }

    if (filtersState.companyId) {
      filters.companyId = filtersState.companyId;
    } else if (selectedCompany?.id) {
      filters.companyId = selectedCompany.id;
    }

    if (filtersState.teamId) filters.teamId = filtersState.teamId;

    return filters;
  }, [filtersState, selectedCompany]);

  const {
    isLoading,
    error,
    getColumnActions,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeAction,
  } = useKanbanActions(apiFilters);

  const handleActionClick = (actionId: string) => {
    setSelectedActionId(actionId);
    setSheetOpen(true);
  };

  if (isLoading) return <ActionListSkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load actions. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnActions = getColumnActions(column.status);

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                actions={columnActions}
                onActionClick={handleActionClick}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeAction && <ActionKanbanCard action={activeAction} isDragging />}
        </DragOverlay>
      </DndContext>

      <ActionDetailSheet
        actionId={selectedActionId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
```

**Step 3: Update KanbanCard to separate click/drag areas**

```typescript
function ActionKanbanCard({
  action,
  onClick,
  isDragging = false
}: {
  action: Action;
  onClick?: () => void;
  isDragging?: boolean
}) {
  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '0/0';

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Clickable area - opens drawer */}
        <div
          className="cursor-pointer"
          onClick={onClick}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2 leading-tight hover:text-blue-600">
              {action.title}
            </h4>
            <PriorityBadge priority={action.priority} className="shrink-0 text-[10px] px-1.5 py-0 h-5" />
          </div>
        </div>

        {/* Draggable area */}
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={action.status} className="text-[10px] px-1.5 py-0 h-5" />
            <LateIndicator isLate={action.isLate} className="text-[10px]" />
            <BlockedBadge
              isBlocked={action.isBlocked}
              reason={action.blockedReason}
              className="text-[10px] px-1.5 py-0 h-5"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-2">
              <span title="Responsible">
                {action.responsibleId ? `#${action.responsibleId.slice(0, 8)}` : '—'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span title="Due Date">
                {format(new Date(action.estimatedEndDate), 'MMM d')}
              </span>
              <span title="Checklist" className="flex items-center gap-1">
                 ☑ {checklistProgress}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 4: Commit component changes**

```bash
git add src/components/features/actions/action-list/action-kanban-board.tsx
git commit -m "feat(components): update Kanban to use position-aware hook"
```

---

## Task 13: Testing

**Files:**
- Test manually with browser

**Step 1: Start both servers**

Terminal 1:
```bash
cd tooldo-api
npm run start:dev
```

Terminal 2:
```bash
cd tooldo-app
npm run dev
```

**Step 2: Test create action**

- Create a new action
- Verify it appears at the bottom of TODO column
- Check database: `kanbanOrder` record created with correct position

**Step 3: Test drag and drop**

- Drag action from TODO to IN_PROGRESS
- Verify:
  - Action moves visually
  - Position updates in database
  - `actualStartDate` is set
  - `ActionMovement` record created

**Step 4: Test drag within column**

- Drag action to different position in same column
- Verify:
  - Actions reorder correctly
  - Positions update in database
  - Other actions shift positions

**Step 5: Test drag to DONE**

- Drag action to DONE column
- Verify:
  - `actualEndDate` is set
  - Movement recorded

**Step 6: Test checklist in drawer**

- Open action drawer
- Add checklist items
- Toggle items
- Verify updates persist

**Step 7: Document test results**

Create: `tooldo-api/docs/testing/kanban-ordering-test-results.md`

```markdown
# Kanban Ordering Test Results

## Test Date: YYYY-MM-DD

### Create Action
- [ ] Action appears in TODO column
- [ ] KanbanOrder created with position 0 (or next available)
- [ ] Database record verified

### Drag to Different Column
- [ ] Visual update immediate
- [ ] Position calculated correctly
- [ ] actualStartDate set when moving to IN_PROGRESS
- [ ] actualEndDate set when moving to DONE
- [ ] ActionMovement record created
- [ ] timeSpent calculated

### Drag Within Column
- [ ] Action moves to new position
- [ ] Other actions reorder
- [ ] Positions update in database

### Edge Cases
- [ ] Dragging to empty column works
- [ ] Dragging to position 0 works
- [ ] Dragging to last position works
- [ ] Multiple rapid drags handled correctly

### Performance
- [ ] Drag feels smooth (no lag)
- [ ] API responds < 500ms
- [ ] No console errors
```

---

## Completion Checklist

- [ ] Backend schema updated with KanbanOrder and ActionMovement
- [ ] Migration created and data migrated
- [ ] DTOs updated with position support
- [ ] Services implement reordering logic
- [ ] Repositories support KanbanOrder operations
- [ ] Controller accepts position parameter
- [ ] Frontend types match backend
- [ ] API client updated
- [ ] useKanbanActions hook created with sensors
- [ ] Components use new hook
- [ ] Click/drag areas separated
- [ ] All tests pass
- [ ] Documentation updated

---

## Notes

**Performance Considerations:**
- KanbanOrder has indexes on (column, position) and (column, sortOrder)
- Reordering uses batch updates (updateMany)
- React Query caching reduces unnecessary API calls

**Future Enhancements:**
- Add optimistic updates for drag and drop
- Add undo/redo for movements
- Add movement analytics dashboard
- Add bulk move operations
- Add swimlanes by team/priority

**Related Files:**
- Backend: `tooldo-api/src/`
- Frontend: `tooldo-app/src/`
- Schema: `tooldo-api/prisma/schema.prisma`

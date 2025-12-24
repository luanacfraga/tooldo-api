# Action Plans Module - Design Document

**Date:** 2025-12-24
**Status:** Approved
**Architecture:** Clean Architecture / Hexagonal

---

## 1. Overview

The Action Plans module enables teams to create, track, and manage action items in a Kanban-style board. This module is core to the productivity tracking system, providing metrics and insights about team performance.

### Key Features

- **Kanban Board**: 3-column board (TODO, IN_PROGRESS, DONE)
- **AI Generation**: AI-powered action plan suggestions with rich context
- **Metrics Dashboard**: Real-time productivity metrics and analytics
- **Team & Company Scope**: Actions can belong to teams or companies
- **Movement History**: Full audit trail of status changes
- **Rich Metadata**: Checklists, tags, attachments, priorities, blocking reasons

---

## 2. Domain Model

### 2.1 Core Entities

#### Action
Main entity representing an action plan.

**Properties:**
- `id`: UUID
- `title`: string (required)
- `description`: text (required)
- `status`: ActionStatus enum (TODO, IN_PROGRESS, DONE)
- `priority`: ActionPriority enum (LOW, MEDIUM, HIGH, URGENT)
- `estimatedStartDate`: DateTime (required)
- `estimatedEndDate`: DateTime (required)
- `actualStartDate`: DateTime (nullable)
- `actualEndDate`: DateTime (nullable)
- `isLate`: boolean (auto-calculated)
- `isBlocked`: boolean (default: false)
- `blockedReason`: text (required if isBlocked=true)
- `companyId`: UUID (required)
- `teamId`: UUID (optional - allows company-level or team-level actions)
- `creatorId`: UUID (auto-set to current user)
- `responsibleId`: UUID (required)
- `createdAt`, `updatedAt`, `deletedAt`: timestamps

**Business Rules:**
1. `estimatedEndDate` must be after `estimatedStartDate`
2. `isLate` is auto-calculated:
   - Late to start: status=TODO and today > estimatedStartDate
   - Late to finish: status!=DONE and today > estimatedEndDate
   - Finished late: status=DONE and actualEndDate > estimatedEndDate
3. If `isBlocked=true`, `blockedReason` is mandatory
4. Status transitions:
   - TODO → IN_PROGRESS (sets actualStartDate)
   - IN_PROGRESS → DONE (sets actualEndDate)
   - IN_PROGRESS → TODO (reopen)
   - DONE → IN_PROGRESS (reopen)

#### ChecklistItem
Sub-tasks within an action.

**Properties:**
- `id`: UUID
- `actionId`: UUID
- `description`: text
- `isCompleted`: boolean (default: false)
- `order`: int (display order)

#### ActionMovement
Audit trail of status changes.

**Properties:**
- `id`: UUID
- `actionId`: UUID
- `fromStatus`: ActionStatus
- `toStatus`: ActionStatus
- `movedById`: UUID
- `movedAt`: DateTime (default: now)
- `notes`: text (optional)

#### KanbanOrder
Position of action in the Kanban board.

**Properties:**
- `id`: UUID
- `actionId`: UUID (unique)
- `column`: ActionStatus (TODO, IN_PROGRESS, DONE)
- `position`: int (position within column)
- `sortOrder`: int (for custom sorting)

#### ActionTag
Labels for categorization.

**Properties:**
- `id`: UUID
- `actionId`: UUID
- `label`: string (max 50 chars)
- `color`: string (hex color, e.g., "#FF5733")

#### ActionAttachment
File attachments.

**Properties:**
- `id`: UUID
- `actionId`: UUID
- `fileName`: string
- `fileUrl`: text
- `fileType`: string
- `uploadedAt`: DateTime

---

## 3. Permissions & Access Control

### Role-Based Permissions

| Role       | Create                          | Edit                          | Delete              | View                     |
|------------|---------------------------------|-------------------------------|---------------------|--------------------------|
| EXECUTOR   | Only for self (`responsibleId = userId`) | Own actions only | No | Own actions |
| MANAGER    | For self or team members        | Team actions or own           | Team actions or own | Team actions |
| ADMIN      | For anyone in company           | Any company action            | Any company action  | All company actions |
| CONSULTANT | No | No | No | All actions (read-only) |
| MASTER     | No access to this module        | No access | No access | No access |

### Validation Rules

**Create:**
- User must belong to the specified company
- If `teamId` provided, user must be member of that team
- Responsible user must exist and belong to company
- Role-based restrictions apply (see table above)

**Edit:**
- User must be: creator, responsible, or hierarchical superior
- Can't change `companyId` or `teamId` after creation
- Can't change `creatorId` or timestamps

**Delete:**
- Soft delete only (`deletedAt` set)
- Only creator, MANAGER (for team), or ADMIN (for company)

---

## 4. API Endpoints

### 4.1 CRUD Operations

```
POST   /api/v1/actions              Create action
GET    /api/v1/actions              List actions (with filters)
GET    /api/v1/actions/:id          Get action by ID
PUT    /api/v1/actions/:id          Update action
DELETE /api/v1/actions/:id          Soft delete action
```

### 4.2 Board Operations

```
PATCH  /api/v1/actions/:id/move     Move to different status/column
GET    /api/v1/actions/board        Get board view (grouped by status)
```

### 4.3 Blocking

```
PATCH  /api/v1/actions/:id/block    Mark as blocked
PATCH  /api/v1/actions/:id/unblock  Unblock action
```

### 4.4 Checklist

```
POST   /api/v1/actions/:id/checklist              Add checklist item
PATCH  /api/v1/actions/:id/checklist/:itemId/toggle  Toggle completion
DELETE /api/v1/actions/:id/checklist/:itemId         Remove item
```

### 4.5 AI Generation

```
POST   /api/v1/actions/ai-generate  Generate action suggestion with AI
```

**Input (GenerateActionWithAIDto):**
```typescript
{
  userPrompt: string;           // What user wants to create
  companyId: string;            // Required
  teamId?: string;              // Optional
  responsibleId: string;        // Who will execute
  includeRecentActions?: boolean; // Include recent actions in AI context
}
```

**Output:**
Returns a complete `CreateActionDto` pre-filled by AI (not saved to database). User reviews and then calls `POST /actions` to create.

### 4.6 Metrics & Analytics

```
GET    /api/v1/actions/metrics      Get productivity metrics
GET    /api/v1/actions/:id/movements Get movement history
```

### 4.7 Query Filters (GET /actions)

All filters are optional except `companyId` for non-ADMIN users.

```typescript
{
  companyId?: string;      // Filter by company
  teamId?: string;         // Filter by team
  responsibleId?: string;  // Filter by responsible
  status?: ActionStatus;   // Filter by status
  priority?: ActionPriority; // Filter by priority
  isLate?: boolean;        // Filter late actions
  isBlocked?: boolean;     // Filter blocked actions
  startDate?: DateTime;    // Actions with estimatedStartDate >= this
  endDate?: DateTime;      // Actions with estimatedEndDate <= this
  page?: number;           // Pagination
  limit?: number;          // Items per page
}
```

---

## 5. AI Integration

### 5.1 Context Collection

When generating an action with AI, the system collects rich context:

```typescript
{
  company: {
    name: string;
    description?: string;
  },
  team?: {
    name: string;
    description?: string;
    membersCount: number;
  },
  responsible: {
    name: string;
    role: UserRole;
  },
  recentActions?: Array<{
    title: string;
    priority: ActionPriority;
    status: ActionStatus;
  }>
}
```

### 5.2 Prompt Template

```
System: You are a specialized assistant in project management and productivity.
Help create detailed and realistic action plans.

User Context:
- Company: {company.name}
- Team: {team.name} (if applicable)
- Responsible: {responsible.name} ({responsible.role})
- Recent team actions: {recentActions} (if includeRecentActions=true)

User Request: "{userPrompt}"

Generate a JSON action plan with:
- title: clear and objective
- description: detailed with context and objectives
- priority: LOW | MEDIUM | HIGH | URGENT (evaluate urgency)
- estimatedStartDate: suggested start date (ISO format)
- estimatedEndDate: suggested completion date (ISO format)
- checklistItems: array of 3-5 sub-tasks
- tags: array of 2-3 relevant tags (label and hex color)

Be realistic with timeframe estimates.
```

### 5.3 IA Usage Tracking

- Uses existing `IAUsageService` to track token consumption
- Counts against user's subscription plan limits
- Throws error if limit exceeded

---

## 6. Metrics & Dashboard

### 6.1 Calculated Metrics

All metrics are calculated in real-time via optimized queries.

```typescript
interface ActionMetrics {
  // Totals
  total: number;
  byStatus: {
    todo: number;
    inProgress: number;
    done: number;
  };

  // Delays
  lateToStart: number;        // TODO and passed estimatedStartDate
  lateInProgress: number;     // IN_PROGRESS and passed estimatedEndDate
  lateCompleted: number;      // DONE with actualEndDate > estimatedEndDate

  // Timeliness
  completedOnTime: number;    // DONE with actualEndDate <= estimatedEndDate
  startedOnTime: number;      // Started with actualStartDate <= estimatedStartDate
  startedLate: number;        // Started with actualStartDate > estimatedStartDate

  // Time periods
  thisWeek: {
    created: number;
    completed: number;
  };

  // By priority
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };

  // Blocked
  blocked: number;
}
```

### 6.2 Database Indexes

Performance optimized with indexes:

```prisma
@@index([companyId, status])
@@index([teamId, status])
@@index([responsibleId])
@@index([createdAt])
@@index([estimatedStartDate])
@@index([estimatedEndDate])
```

---

## 7. Architecture Layers

Following Clean Architecture principles:

### 7.1 Domain Layer
`src/core/domain/action/`

- **Entities**: `Action`, `ChecklistItem`, `ActionMovement`
- **Value Objects**: `ActionStatus`, `ActionPriority`
- **Business Rules**: Validation, state transitions, isLate calculation

### 7.2 Ports (Interfaces)
`src/core/ports/repositories/`

- `ActionRepository`: CRUD operations interface

### 7.3 Application Layer
`src/application/services/action/`

**Use Cases:**
- `CreateActionService`: Create new action
- `UpdateActionService`: Update existing action
- `MoveActionService`: Move in board (change status)
- `BlockActionService`: Mark as blocked
- `UnblockActionService`: Unblock action
- `GenerateActionWithAIService`: Generate with AI
- `ListActionsService`: List with filters and permissions
- `GetActionMetricsService`: Calculate metrics
- `DeleteActionService`: Soft delete

### 7.4 Infrastructure Layer
`src/infra/database/repositories/`

- `ActionPrismaRepository`: Prisma implementation of ActionRepository

### 7.5 API Layer
`src/api/action/`

- `ActionController`: HTTP endpoints
- **DTOs**: `CreateActionDto`, `UpdateActionDto`, `GenerateActionWithAIDto`, `MoveActionDto`, `ActionResponseDto`

---

## 8. Data Flow Examples

### 8.1 Create Action

```
User → POST /actions
  ↓
ActionController validates DTO
  ↓
CreateActionService
  ↓ validates permissions (role-based)
  ↓ validates company/team/responsible
  ↓ creates Action entity
  ↓ creates KanbanOrder (last position in TODO)
  ↓ creates ChecklistItems (if provided)
  ↓
ActionRepository.create()
  ↓
Prisma saves to database
  ↓
Returns ActionResponseDto
```

### 8.2 Move Action in Board

```
User → PATCH /actions/:id/move { toStatus: 'IN_PROGRESS' }
  ↓
ActionController validates
  ↓
MoveActionService
  ↓ validates status transition (TODO → IN_PROGRESS allowed)
  ↓ sets actualStartDate = now() (first time moving to IN_PROGRESS)
  ↓ creates ActionMovement record
  ↓ updates KanbanOrder (column + position)
  ↓ recalculates isLate
  ↓
ActionRepository.update()
  ↓
Returns updated ActionResponseDto
```

### 8.3 Generate with AI

```
User → POST /actions/ai-generate { userPrompt, companyId, ... }
  ↓
ActionController validates DTO
  ↓
GenerateActionWithAIService
  ↓ fetches company data
  ↓ fetches team data (if teamId)
  ↓ fetches responsible user
  ↓ fetches recent actions (if includeRecentActions=true)
  ↓ builds rich context
  ↓ constructs AI prompt
  ↓ calls AI service (via IAUsageService)
  ↓ parses AI response (JSON)
  ↓ validates generated DTO
  ↓
Returns CreateActionDto (not saved)
  ↓
User reviews and calls POST /actions to create
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

- **Domain Entities**: Validation rules, business logic
- **Services**: Use cases with mocked repositories
- **Repositories**: Prisma operations with test database

### 9.2 Integration Tests

- Controller → Service → Repository flow
- Permission validations
- Database transactions

### 9.3 E2E Tests

- Complete user flows:
  - Create action → Move to IN_PROGRESS → Complete
  - Generate with AI → Review → Create
  - Get metrics with various filters

---

## 10. Database Schema (Prisma)

```prisma
model Action {
  id                 String           @id @default(uuid())
  title              String
  description        String           @db.Text
  status             ActionStatus     @default(TODO)
  priority           ActionPriority   @default(MEDIUM)

  estimatedStartDate DateTime         @map("estimated_start_date")
  estimatedEndDate   DateTime         @map("estimated_end_date")
  actualStartDate    DateTime?        @map("actual_start_date")
  actualEndDate      DateTime?        @map("actual_end_date")

  isLate             Boolean          @default(false) @map("is_late")
  isBlocked          Boolean          @default(false) @map("is_blocked")
  blockedReason      String?          @db.Text @map("blocked_reason")

  companyId          String           @map("company_id")
  teamId             String?          @map("team_id")
  creatorId          String           @map("creator_id")
  responsibleId      String           @map("responsible_id")

  createdAt          DateTime         @default(now()) @map("created_at")
  updatedAt          DateTime         @updatedAt @map("updated_at")
  deletedAt          DateTime?        @map("deleted_at")

  company            Company          @relation(fields: [companyId], references: [id])
  team               Team?            @relation(fields: [teamId], references: [id])
  creator            User             @relation("ActionCreator", fields: [creatorId], references: [id])
  responsible        User             @relation("ActionResponsible", fields: [responsibleId], references: [id])

  checklistItems     ChecklistItem[]
  movements          ActionMovement[]
  kanbanOrder        KanbanOrder?
  tags               ActionTag[]
  attachments        ActionAttachment[]

  @@map("actions")
  @@index([companyId, status])
  @@index([teamId, status])
  @@index([responsibleId])
  @@index([createdAt])
  @@index([estimatedStartDate])
  @@index([estimatedEndDate])
}

model ChecklistItem {
  id          String   @id @default(uuid())
  actionId    String   @map("action_id")
  description String   @db.Text
  isCompleted Boolean  @default(false) @map("is_completed")
  order       Int
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  action      Action   @relation(fields: [actionId], references: [id], onDelete: Cascade)

  @@map("checklist_items")
  @@index([actionId])
}

model ActionMovement {
  id            String       @id @default(uuid())
  actionId      String       @map("action_id")
  fromStatus    ActionStatus @map("from_status")
  toStatus      ActionStatus @map("to_status")
  movedById     String       @map("moved_by_id")
  movedAt       DateTime     @default(now()) @map("moved_at")
  notes         String?      @db.Text

  action        Action       @relation(fields: [actionId], references: [id], onDelete: Cascade)
  movedBy       User         @relation(fields: [movedById], references: [id])

  @@map("action_movements")
  @@index([actionId])
  @@index([movedAt])
}

model KanbanOrder {
  id         String       @id @default(uuid())
  actionId   String       @unique @map("action_id")
  column     ActionStatus
  position   Int
  sortOrder  Int          @map("sort_order")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  action     Action       @relation(fields: [actionId], references: [id], onDelete: Cascade)

  @@map("kanban_orders")
  @@index([column, position])
}

model ActionTag {
  id        String   @id @default(uuid())
  actionId  String   @map("action_id")
  label     String   @db.VarChar(50)
  color     String?  @db.VarChar(7)

  action    Action   @relation(fields: [actionId], references: [id], onDelete: Cascade)

  @@map("action_tags")
  @@index([actionId])
}

model ActionAttachment {
  id        String   @id @default(uuid())
  actionId  String   @map("action_id")
  fileName  String   @map("file_name")
  fileUrl   String   @map("file_url") @db.Text
  fileType  String?  @map("file_type")
  uploadedAt DateTime @default(now()) @map("uploaded_at")

  action    Action   @relation(fields: [actionId], references: [id], onDelete: Cascade)

  @@map("action_attachments")
  @@index([actionId])
}

enum ActionStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum ActionPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

---

## 11. Implementation Plan

### Phase 1: Core Domain
1. Create Prisma schema and migration
2. Implement domain entities with validation
3. Define repository interfaces

### Phase 2: Infrastructure
4. Implement Prisma repositories
5. Write repository unit tests

### Phase 3: Application Services
6. Implement CRUD services
7. Implement MoveActionService
8. Implement BlockActionService
9. Write service unit tests

### Phase 4: API Layer
10. Create DTOs with validation
11. Implement ActionController
12. Write controller tests

### Phase 5: AI Integration
13. Implement GenerateActionWithAIService
14. Test AI prompt engineering
15. Integrate with IAUsageService

### Phase 6: Metrics
16. Implement GetActionMetricsService
17. Optimize queries with proper indexes
18. Test performance with large datasets

### Phase 7: Integration
19. Write integration tests
20. Write E2E tests
21. Documentation and API docs (Swagger)

---

## 12. Future Enhancements

Not in scope for MVP, but potential future additions:

- **Dependencies**: Actions can depend on other actions
- **Comments**: Discussion threads on actions
- **Time Tracking**: Actual hours worked vs estimated
- **Custom Statuses**: Configurable status per company
- **Notifications**: Slack/email alerts for deadlines
- **Templates**: Reusable action templates
- **Subtasks**: Nested actions (parent-child hierarchy)
- **Recurring Actions**: Auto-create periodic actions

---

## 13. Success Criteria

The module is considered complete when:

1. ✅ All CRUD operations work with proper permissions
2. ✅ Kanban board operations (move, reorder) function correctly
3. ✅ AI generation produces valid and useful action suggestions
4. ✅ Metrics endpoint returns accurate real-time data
5. ✅ All tests pass (unit, integration, E2E)
6. ✅ Performance acceptable with 10,000+ actions
7. ✅ Full Swagger documentation
8. ✅ Code review approved

---

**End of Design Document**

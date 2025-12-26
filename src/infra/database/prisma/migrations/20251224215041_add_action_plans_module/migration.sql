-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "ActionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'TODO',
    "priority" "ActionPriority" NOT NULL DEFAULT 'MEDIUM',
    "estimated_start_date" TIMESTAMP(3) NOT NULL,
    "estimated_end_date" TIMESTAMP(3) NOT NULL,
    "actual_start_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "is_late" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_reason" TEXT,
    "company_id" TEXT NOT NULL,
    "team_id" TEXT,
    "creator_id" TEXT NOT NULL,
    "responsible_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_movements" (
    "id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "from_status" "ActionStatus" NOT NULL,
    "to_status" "ActionStatus" NOT NULL,
    "moved_by_id" TEXT NOT NULL,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "action_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_orders" (
    "id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "column" "ActionStatus" NOT NULL,
    "position" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_tags" (
    "id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7),

    CONSTRAINT "action_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_attachments" (
    "id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actions_company_id_status_idx" ON "actions"("company_id", "status");

-- CreateIndex
CREATE INDEX "actions_team_id_status_idx" ON "actions"("team_id", "status");

-- CreateIndex
CREATE INDEX "actions_responsible_id_idx" ON "actions"("responsible_id");

-- CreateIndex
CREATE INDEX "actions_created_at_idx" ON "actions"("created_at");

-- CreateIndex
CREATE INDEX "actions_estimated_start_date_idx" ON "actions"("estimated_start_date");

-- CreateIndex
CREATE INDEX "actions_estimated_end_date_idx" ON "actions"("estimated_end_date");

-- CreateIndex
CREATE INDEX "checklist_items_action_id_idx" ON "checklist_items"("action_id");

-- CreateIndex
CREATE INDEX "action_movements_action_id_idx" ON "action_movements"("action_id");

-- CreateIndex
CREATE INDEX "action_movements_moved_at_idx" ON "action_movements"("moved_at");

-- CreateIndex
CREATE UNIQUE INDEX "kanban_orders_action_id_key" ON "kanban_orders"("action_id");

-- CreateIndex
CREATE INDEX "kanban_orders_column_position_idx" ON "kanban_orders"("column", "position");

-- CreateIndex
CREATE INDEX "action_tags_action_id_idx" ON "action_tags"("action_id");

-- CreateIndex
CREATE INDEX "action_attachments_action_id_idx" ON "action_attachments"("action_id");

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_movements" ADD CONSTRAINT "action_movements_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_movements" ADD CONSTRAINT "action_movements_moved_by_id_fkey" FOREIGN KEY ("moved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_orders" ADD CONSTRAINT "kanban_orders_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_tags" ADD CONSTRAINT "action_tags_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_attachments" ADD CONSTRAINT "action_attachments_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

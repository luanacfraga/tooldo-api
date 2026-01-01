-- AlterTable
ALTER TABLE "action_movements" ADD COLUMN     "time_spent" INTEGER;

-- AlterTable
ALTER TABLE "kanban_orders" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "sort_order" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "action_movements_moved_by_id_idx" ON "action_movements"("moved_by_id");

-- CreateIndex
CREATE INDEX "kanban_orders_column_sort_order_idx" ON "kanban_orders"("column", "sort_order");

-- CreateIndex
CREATE INDEX "kanban_orders_column_last_moved_at_idx" ON "kanban_orders"("column", "last_moved_at");

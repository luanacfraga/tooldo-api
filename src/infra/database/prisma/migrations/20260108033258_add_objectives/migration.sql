-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_color" TEXT,
ADD COLUMN     "initials" TEXT;

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "objectives_company_id_team_id_idx" ON "objectives"("company_id", "team_id");

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "CompanyUserStatus" AS ENUM ('invited', 'active', 'rejected', 'suspended', 'removed');

-- AlterTable
ALTER TABLE "company_users" ADD COLUMN     "accepted_at" TIMESTAMP(3),
ADD COLUMN     "invited_at" TIMESTAMP(3),
ADD COLUMN     "invited_by" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "status" "CompanyUserStatus" NOT NULL DEFAULT 'invited';

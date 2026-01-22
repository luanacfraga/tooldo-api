/*
  Warnings:

  - Added the required column `root_cause` to the `actions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add column with temporary default value for existing rows
ALTER TABLE "actions" ADD COLUMN "root_cause" TEXT NOT NULL DEFAULT 'Causa raiz não especificada';

-- Remove default for new inserts (schema doesn't define a default)
ALTER TABLE "actions" ALTER COLUMN "root_cause" DROP DEFAULT;

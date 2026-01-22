-- AlterTable
-- Adiciona a coluna root_cause como nullable primeiro
ALTER TABLE "actions" ADD COLUMN "root_cause" TEXT;

-- Atualiza registros existentes com um valor padrão
UPDATE "actions" SET "root_cause" = 'Causa fundamental não especificada' WHERE "root_cause" IS NULL;

-- Torna a coluna obrigatória
ALTER TABLE "actions" ALTER COLUMN "root_cause" SET NOT NULL;

import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DevDatabaseCleanupService {
  private readonly logger = new Logger(DevDatabaseCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Limpa os dados de domínio do ambiente de desenvolvimento.
   *
   * Importante:
   * - Não altera a estrutura do banco (sem DROP/ALTER).
   * - Mantém usuários, planos e assinaturas.
   * - Remove dados de empresas, times, ações e artefatos relacionados.
   */
  async cleanDomainData(): Promise<void> {
    this.logger.warn('Executando limpeza de dados de DEV (domínio)');

    await this.prisma.$transaction(async (tx) => {
      // Ordem pensada para evitar problemas de FK mesmo sem o CASCADE do TRUNCATE.
      await tx.$executeRawUnsafe(`
        TRUNCATE TABLE
          "actions",
          "subscriptions",
          "plans",
          "users",
          "companies",
          "company_users",
          "teams",
          "team_users",
          "actions",
          "action_movements",
          "checklist_items",
          "action_tags",
          "action_attachments",
          "kanban_orders",
          "objectives",
          "action_attachments",
          "action_tags",
          "kanban_orders",
          "action_movements",
          "checklist_items",
          "actions",
          "objectives",
          "team_users",
          "teams",
          "company_users",
          "ia_usages",
          "companies"
        RESTART IDENTITY CASCADE;
      `);
    });

    this.logger.log('Limpeza de dados de DEV concluída com sucesso');
  }
}

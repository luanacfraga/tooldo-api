import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface PrismaQueryEvent {
  query: string;
  params: string;
  duration: number;
  target: string;
}

interface PrismaErrorEvent {
  message: string;
  target: string;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  private static getDatabaseUrl(): string {
    const logger = new Logger(PrismaService.name);

    // Se DATABASE_URL já estiver definida, usar ela
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL;
    }

    // Caso contrário, construir a partir de variáveis individuais
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER;
    const dbPass = process.env.DB_PASS;
    const dbName = process.env.DB_NAME;
    const dbPort = process.env.DB_PORT || '5432';
    const dbSchema = process.env.DB_SCHEMA || 'public';

    if (dbHost && dbUser && dbPass && dbName) {
      // Fazer URL encoding da senha para tratar caracteres especiais
      const encodedUser = encodeURIComponent(dbUser);
      const encodedPass = encodeURIComponent(dbPass);
      const encodedDbName = encodeURIComponent(dbName);

      const databaseUrl = `postgresql://${encodedUser}:${encodedPass}@${dbHost}:${dbPort}/${encodedDbName}?schema=${dbSchema}`;

      // Log apenas do host para debug (sem expor senha)
      logger.log(`Database URL construída para host: ${dbHost}`);

      return databaseUrl;
    }

    throw new Error(
      'DATABASE_URL or DB_HOST, DB_USER, DB_PASS, DB_NAME must be set',
    );
  }

  constructor() {
    const databaseUrl = PrismaService.getDatabaseUrl();

    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      this.$on('query' as never, (e: PrismaQueryEvent) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    this.$on('error' as never, (e: PrismaErrorEvent) => {
      this.logger.error('Prisma error:', e);
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}

import { Roles } from '@/api/auth/decorators/roles.decorator';
import { DevDatabaseCleanupService } from '@/api/dev/dev-database-cleanup.service';
import { UserRole } from '@/core/domain/shared/enums';
import {
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Dev')
@Controller('dev')
export class DevController {
  private readonly logger = new Logger(DevController.name);

  constructor(
    private readonly devDatabaseCleanupService: DevDatabaseCleanupService,
    private readonly configService: ConfigService,
  ) {}

  private ensureDevelopmentEnvironment(): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (nodeEnv === 'production') {
      this.logger.error(
        'Tentativa de usar endpoint de DEV em ambiente de produção',
      );
      throw new ForbiddenException(
        'Este endpoint só pode ser utilizado em ambiente de desenvolvimento',
      );
    }
  }

  @Post('cleanup')
  @Roles(UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Limpar dados de desenvolvimento (somente DEV)',
    description:
      'Remove dados de empresas, times, ações e relacionamentos, mantendo usuários, planos e assinaturas. Disponível apenas em ambiente de desenvolvimento e para usuários MASTER.',
  })
  @ApiOkResponse({
    description: 'Dados de desenvolvimento limpos com sucesso',
  })
  @ApiForbiddenResponse({
    description:
      'Disponível apenas em ambiente de desenvolvimento ou acesso não autorizado',
  })
  async cleanup() {
    //this.ensureDevelopmentEnvironment();

    await this.devDatabaseCleanupService.cleanDomainData();

    const timestamp = new Date().toISOString();

    this.logger.log(`Dev cleanup executado em ${timestamp}`);

    return {
      message: 'Dev data cleanup executed successfully',
      timestamp,
    };
  }
}

import { Roles } from '@/api/auth/decorators/roles.decorator';
import { DevDatabaseCleanupService } from '@/api/dev/dev-database-cleanup.service';
import { UserRole } from '@/core/domain/shared/enums';
import { Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
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
  ) {}

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
    await this.devDatabaseCleanupService.cleanDomainData();

    const timestamp = new Date().toISOString();

    this.logger.log(`Dev cleanup executado em ${timestamp}`);

    return {
      message: 'Dev data cleanup executed successfully',
      timestamp,
    };
  }
}

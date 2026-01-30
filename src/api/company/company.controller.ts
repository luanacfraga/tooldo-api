import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { Roles } from '@/api/auth/decorators/roles.decorator';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { CreateCompanyService } from '@/application/services/company/create-company.service';
import { DeleteCompanyService } from '@/application/services/company/delete-company.service';
import { GetCompanyDashboardSummaryService } from '@/application/services/company/get-company-dashboard-summary.service';
import { GetExecutorDashboardService } from '@/application/services/company/get-executor-dashboard.service';
import { ListActiveCompaniesWithPlansService } from '@/application/services/company/list-active-companies-with-plans.service';
import { ListCompaniesService } from '@/application/services/company/list-companies.service';
import { UpdateCompanyService } from '@/application/services/company/update-company.service';
import { SetCompanyBlockedService } from '@/application/services/company/set-company-blocked.service';
import { UpdateSubscriptionPlanByCompanyService } from '@/application/services/company/update-subscription-plan-by-company.service';
import { Company } from '@/core/domain/company/company.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { PlanRepository } from '@/core/ports/repositories/plan.repository';
import type { SubscriptionRepository } from '@/core/ports/repositories/subscription.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PlanResponseDto } from '../plan/dto/plan-response.dto';
import { EmployeeResponseDto } from '../employee/dto/employee-response.dto';
import { ActiveCompanyWithPlanResponseDto } from './dto/active-company-with-plan-response.dto';
import { CompanyDashboardSummaryResponseDto } from './dto/company-dashboard-summary-response.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CompanySettingsResponseDto } from './dto/company-settings-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ExecutorDashboardQueryDto } from './dto/executor-dashboard-query.dto';
import { ExecutorDashboardResponseDto } from './dto/executor-dashboard-response.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SetCompanyBlockedDto } from './dto/set-company-blocked.dto';
import { UpdateCompanyPlanDto } from './dto/update-company-plan.dto';

@ApiTags('Company')
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly createCompanyService: CreateCompanyService,
    private readonly listCompaniesService: ListCompaniesService,
    private readonly listActiveCompaniesWithPlansService: ListActiveCompaniesWithPlansService,
    private readonly updateCompanyService: UpdateCompanyService,
    private readonly updateSubscriptionPlanByCompanyService: UpdateSubscriptionPlanByCompanyService,
    private readonly setCompanyBlockedService: SetCompanyBlockedService,
    private readonly deleteCompanyService: DeleteCompanyService,
    private readonly getCompanyDashboardSummaryService: GetCompanyDashboardSummaryService,
    private readonly getExecutorDashboardService: GetExecutorDashboardService,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PlanRepository')
    private readonly planRepository: PlanRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new company for an admin',
    description:
      'Cria uma nova empresa para um administrador. Valida se o admin existe, se tem uma assinatura ativa e se não excedeu o limite de empresas do plano. Apenas admins podem criar empresas.',
  })
  @ApiCreatedResponse({
    description: 'Company successfully created',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input or limit exceeded',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Admin, subscription or plan not found',
  })
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyResponseDto> {
    const adminId = createCompanyDto.adminId ?? user?.sub;
    const result = await this.createCompanyService.execute({
      name: createCompanyDto.name,
      description: createCompanyDto.description,
      adminId,
    });

    return CompanyResponseDto.fromDomain(result.company);
  }

  @Get('me')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.EXECUTOR,
    UserRole.CONSULTANT,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List companies of authenticated user',
    description:
      'Lista empresas do usuário autenticado. Admins veem todas suas empresas. Managers, executores e consultores veem apenas a empresa onde estão ativos.',
  })
  @ApiOkResponse({
    description: 'Companies successfully retrieved',
    type: [CompanyResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - User not found',
  })
  async listMyCompanies(
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyResponseDto[]> {
    if (user.role === UserRole.ADMIN) {
      const adminId = user.sub;
      const result = await this.listCompaniesService.execute({ adminId });

      return result.companies.map((company) =>
        CompanyResponseDto.fromDomain(company),
      );
    }

    const userId = user.sub;
    const companyUsers = await this.companyUserRepository.findByUserId(
      userId,
      CompanyUserStatus.ACTIVE,
    );

    if (companyUsers.length === 0) {
      return [];
    }

    const companyIds = companyUsers.map((cu) => cu.companyId);
    const companies = await Promise.all(
      companyIds.map((id) => this.companyRepository.findById(id)),
    );

    return companies
      .filter((company): company is Company => company !== null)
      .map((company) => CompanyResponseDto.fromDomain(company));
  }

  @Get('active')
  @Roles(UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List active companies with plan (Master only)',
    description:
      'Lista empresas com assinatura ativa e plano atual. Apenas usuários master podem acessar.',
  })
  @ApiOkResponse({
    description: 'Active companies with plan successfully retrieved',
    type: [ActiveCompanyWithPlanResponseDto],
  })
  async listActiveWithPlans(): Promise<ActiveCompanyWithPlanResponseDto[]> {
    const result = await this.listActiveCompaniesWithPlansService.execute();
    return result.items.map((item) => {
      const dto = new ActiveCompanyWithPlanResponseDto();
      dto.company = CompanyResponseDto.fromDomain(item.company);
      dto.subscription = {
        id: item.subscription.id,
        adminId: item.subscription.adminId,
        planId: item.subscription.planId,
        startedAt: item.subscription.startedAt.toISOString(),
        isActive: item.subscription.isActive,
      };
      dto.plan = PlanResponseDto.fromDomain(item.plan);
      dto.adminName = item.adminName;
      return dto;
    });
  }

  @Get('admin/:adminId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List companies of an admin',
    description:
      'Lista todas as empresas de um administrador. Apenas admins e managers podem listar.',
  })
  @ApiParam({
    name: 'adminId',
    description: 'ID do administrador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Companies successfully retrieved',
    type: [CompanyResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Admin not found',
  })
  async listByAdmin(
    @Param('adminId') adminId: string,
  ): Promise<CompanyResponseDto[]> {
    const result = await this.listCompaniesService.execute({ adminId });

    return result.companies.map((company) =>
      CompanyResponseDto.fromDomain(company),
    );
  }

  @Get(':id/dashboard-summary')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.EXECUTOR,
    UserRole.CONSULTANT,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dashboard summary da empresa',
    description:
      'Retorna métricas consolidadas para o dashboard (contagens por status, atrasadas, bloqueadas, taxa de conclusão e listas foco/próximo passo).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Dashboard summary retornado com sucesso',
    type: CompanyDashboardSummaryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async dashboardSummary(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanyDashboardSummaryResponseDto> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new EntityNotFoundException('Empresa', id);
    }

    if (user.role === UserRole.ADMIN) {
      if (company.adminId !== user.sub) {
        throw new EntityNotFoundException('Empresa', id);
      }
    } else {
      const membership = await this.companyUserRepository.findByCompanyAndUser(
        id,
        user.sub,
      );
      if (membership?.status !== CompanyUserStatus.ACTIVE) {
        throw new EntityNotFoundException('Empresa', id);
      }
    }

    const summary = await this.getCompanyDashboardSummaryService.execute({
      companyId: id,
    });

    return CompanyDashboardSummaryResponseDto.fromDomain({
      companyId: summary.companyId,
      totals: summary.totals,
      completionRate: summary.completionRate,
      focusNow: summary.focusNow,
      nextSteps: summary.nextSteps,
    });
  }

  @Get(':id/executor-dashboard')
  @Roles(
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.EXECUTOR,
    UserRole.CONSULTANT,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dashboard do executor (pessoal + contexto da equipe)',
    description:
      'Retorna métricas pessoais do usuário autenticado (totais, concluídas no período, tendência) e, quando aplicável, posição na equipe e próximas ações.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Dashboard do executor retornado com sucesso',
    type: ExecutorDashboardResponseDto,
  })
  async executorDashboard(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: ExecutorDashboardQueryDto,
  ): Promise<ExecutorDashboardResponseDto> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new EntityNotFoundException('Empresa', id);
    }

    if (user.role === UserRole.ADMIN) {
      if (company.adminId !== user.sub) {
        throw new EntityNotFoundException('Empresa', id);
      }
    } else {
      const membership = await this.companyUserRepository.findByCompanyAndUser(
        id,
        user.sub,
      );
      if (membership?.status !== CompanyUserStatus.ACTIVE) {
        throw new EntityNotFoundException('Empresa', id);
      }
    }

    const result = await this.getExecutorDashboardService.execute({
      companyId: id,
      userId: user.sub,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return ExecutorDashboardResponseDto.fromDomain({
      companyId: result.companyId,
      userId: result.userId,
      period: result.period,
      totals: result.totals,
      completionRate: result.completionRate,
      doneInPeriod: result.doneInPeriod,
      doneTrend: result.doneTrend,
      todayTop3: result.todayTop3,
      blockedActions: result.blockedActions,
      impact: result.impact,
      quality: result.quality,
      nextActions: result.nextActions,
      team: result.team,
    });
  }

  @Get(':id/settings')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detalhes da empresa e plano ativo',
    description:
      'Retorna os dados básicos da empresa e o plano atual (subscription ativa) do admin dono da empresa.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Configurações da empresa retornadas com sucesso',
    type: CompanySettingsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company, subscription or plan not found',
  })
  async settings(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<CompanySettingsResponseDto> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new EntityNotFoundException('Empresa', id);
    }

    if (user.role === UserRole.ADMIN) {
      if (company.adminId !== user.sub) {
        throw new EntityNotFoundException('Empresa', id);
      }
    } else {
      const membership = await this.companyUserRepository.findByCompanyAndUser(
        id,
        user.sub,
      );
      if (membership?.status !== CompanyUserStatus.ACTIVE) {
        throw new EntityNotFoundException('Empresa', id);
      }
    }

    const subscription = await this.subscriptionRepository.findActiveByAdminId(
      company.adminId,
    );
    if (!subscription) {
      throw new EntityNotFoundException('Assinatura ativa', company.adminId);
    }

    const plan = await this.planRepository.findById(subscription.planId);
    if (!plan) {
      throw new EntityNotFoundException('Plano', subscription.planId);
    }

    const admin = await this.userRepository.findById(company.adminId);
    if (!admin) {
      throw new EntityNotFoundException('Admin', company.adminId);
    }

    return CompanySettingsResponseDto.fromDomain({
      company,
      plan,
      subscription,
      admin,
    });
  }

  @Get(':id/responsibles')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EXECUTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List possible responsibles for actions in a company',
    description:
      'Retorna os usuários que podem ser responsáveis por ações na empresa, aplicando as regras por papel do usuário (admin, gestor ou executor).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Company responsibles successfully retrieved',
    type: [EmployeeResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company, team or user not found',
  })
  async listCompanyResponsibles(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmployeeResponseDto[]> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new EntityNotFoundException('Empresa', id);
    }

    if (user.role === UserRole.ADMIN) {
      if (company.adminId !== user.sub) {
        throw new EntityNotFoundException('Empresa', id);
      }
    } else {
      const membership = await this.companyUserRepository.findByCompanyAndUser(
        id,
        user.sub,
      );
      if (membership?.status !== CompanyUserStatus.ACTIVE) {
        throw new EntityNotFoundException('Empresa', id);
      }
    }

    const companyUsers =
      await this.companyUserRepository.findByCompanyIdAndStatus(
        id,
        CompanyUserStatus.ACTIVE,
      );

    if (user.role === UserRole.ADMIN) {
      return companyUsers.map((cu) => EmployeeResponseDto.fromDomain(cu));
    }

    if (user.role === UserRole.EXECUTOR) {
      const selfCompanyUser = companyUsers.find((cu) => cu.userId === user.sub);
      if (!selfCompanyUser) {
        throw new EntityNotFoundException('Membro da empresa', user.sub);
      }
      return [EmployeeResponseDto.fromDomain(selfCompanyUser)];
    }

    if (user.role === UserRole.MANAGER) {
      const teamsOfManager = await this.teamRepository.findByManagerId(
        user.sub,
      );
      const teamsInCompany = teamsOfManager.filter(
        (team) => team.companyId === id,
      );

      if (teamsInCompany.length === 0) {
        return [];
      }

      const executorUserIds = new Set<string>();

      for (const team of teamsInCompany) {
        const teamUsers = await this.teamUserRepository.findByTeamId(team.id);
        teamUsers.forEach((m) => {
          executorUserIds.add(m.userId);
        });
      }

      const responsibles = companyUsers.filter((cu) => {
        if (cu.userId === user.sub && cu.role === UserRole.MANAGER) {
          return true;
        }

        if (cu.role === UserRole.EXECUTOR && executorUserIds.has(cu.userId)) {
          return true;
        }

        return false;
      });

      return responsibles.map((cu) => EmployeeResponseDto.fromDomain(cu));
    }

    return [];
  }

  @Patch(':id/plan')
  @Roles(UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update company plan (Master only)',
    description:
      'Altera o plano da assinatura ativa do administrador da empresa. Apenas usuários master podem alterar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Plano atualizado com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Empresa, assinatura ou plano não encontrado',
  })
  async updateCompanyPlan(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyPlanDto,
  ): Promise<{ subscriptionId: string; planId: string }> {
    return this.updateSubscriptionPlanByCompanyService.execute({
      companyId: id,
      planId: dto.planId,
    });
  }

  @Patch(':id/block')
  @Roles(UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Block or unblock company access (Master only)',
    description:
      'Bloqueia ou desbloqueia o acesso da empresa. Quando bloqueada, nenhum usuário (admin, gestor, executor, consultor) consegue fazer login. Apenas master pode alterar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Empresa bloqueada/desbloqueada com sucesso',
    type: CompanyResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Empresa não encontrada',
  })
  async setCompanyBlocked(
    @Param('id') id: string,
    @Body() dto: SetCompanyBlockedDto,
  ): Promise<CompanyResponseDto> {
    const result = await this.setCompanyBlockedService.execute({
      companyId: id,
      blocked: dto.blocked,
    });
    return CompanyResponseDto.fromDomain(result.company);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a company',
    description:
      'Atualiza uma empresa existente. Permite atualizar nome e descrição. Apenas admins podem atualizar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Company successfully updated',
    type: CompanyResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    const result = await this.updateCompanyService.execute({
      id,
      ...updateCompanyDto,
    });

    return CompanyResponseDto.fromDomain(result.company);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a company',
    description:
      'Deleta uma empresa. Remove todos os membros e equipes em cascata. Apenas admins podem deletar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Company successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteCompanyService.execute({ id });
  }
}

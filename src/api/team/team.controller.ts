import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { Roles } from '@/api/auth/decorators/roles.decorator';
import { EmployeeResponseDto } from '@/api/employee/dto/employee-response.dto';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { AddTeamMemberService } from '@/application/services/team/add-team-member.service';
import { CreateTeamService } from '@/application/services/team/create-team.service';
import { DeleteTeamService } from '@/application/services/team/delete-team.service';
import { ListAvailableExecutorsForTeamService } from '@/application/services/team/list-available-executors.service';
import { ListTeamMembersService } from '@/application/services/team/list-team-members.service';
import { ListTeamsByManagerService } from '@/application/services/team/list-teams-by-manager.service';
import { ListTeamsService } from '@/application/services/team/list-teams.service';
import { RemoveTeamMemberService } from '@/application/services/team/remove-team-member.service';
import { UpdateTeamService } from '@/application/services/team/update-team.service';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import {
  DomainValidationException,
  EntityNotFoundException,
} from '@/core/domain/shared/exceptions/domain.exception';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import type { TeamUserRepository } from '@/core/ports/repositories/team-user.repository';
import type { TeamRepository } from '@/core/ports/repositories/team.repository';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
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
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamController {
  constructor(
    private readonly createTeamService: CreateTeamService,
    private readonly updateTeamService: UpdateTeamService,
    private readonly deleteTeamService: DeleteTeamService,
    private readonly listTeamsService: ListTeamsService,
    private readonly listTeamsByManagerService: ListTeamsByManagerService,
    private readonly addTeamMemberService: AddTeamMemberService,
    private readonly removeTeamMemberService: RemoveTeamMemberService,
    private readonly listTeamMembersService: ListTeamMembersService,
    private readonly listAvailableExecutorsForTeamService: ListAvailableExecutorsForTeamService,
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('TeamUserRepository')
    private readonly teamUserRepository: TeamUserRepository,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new team',
    description:
      'Cria uma nova equipe. Valida que o gestor está cadastrado na empresa como manager. Managers só podem criar equipes onde eles são o gestor. Apenas admins e managers podem criar equipes.',
  })
  @ApiCreatedResponse({
    description: 'Team successfully created',
    type: TeamResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input or manager not found',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<TeamResponseDto> {
    // Se for MANAGER, só pode criar equipes onde ele é o gestor
    if (
      user.role === UserRole.MANAGER &&
      createTeamDto.managerId !== user.sub
    ) {
      throw new DomainValidationException(
        'Managers só podem criar equipes onde eles são o gestor',
      );
    }

    const result = await this.createTeamService.execute(createTeamDto);

    return TeamResponseDto.fromDomain(result.team);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a team',
    description:
      'Atualiza uma equipe existente. Permite atualizar nome, descrição, iaContext e gestor. Apenas admins e managers podem atualizar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Team successfully updated',
    type: TeamResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input or manager not found',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Team not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<TeamResponseDto> {
    const result = await this.updateTeamService.execute({
      id,
      ...updateTeamDto,
    });

    return TeamResponseDto.fromDomain(result.team);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a team',
    description: 'Deleta uma equipe. Apenas admins e managers podem deletar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Team successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Team not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteTeamService.execute({ id });
  }

  @Get('company/:companyId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List teams of a company',
    description:
      'Lista todas as equipes de uma empresa. Admins veem todas as equipes. Managers veem apenas suas próprias equipes.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Teams successfully retrieved',
    type: [TeamResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async listByCompany(
    @Param('companyId') companyId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<TeamResponseDto[]> {
    // Se for MANAGER, retorna apenas suas equipes
    if (user.role === UserRole.MANAGER) {
      const result = await this.listTeamsByManagerService.execute({
        managerId: user.sub,
        companyId,
      });
      return result.teams.map((team) => TeamResponseDto.fromDomain(team));
    }

    // Se for ADMIN, retorna todas as equipes da empresa
    const result = await this.listTeamsService.execute({ companyId });
    return result.teams.map((team) => TeamResponseDto.fromDomain(team));
  }

  @Post(':id/members')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add an executor to a team',
    description:
      'Adiciona um executor à equipe. Valida que o executor está cadastrado na empresa como executor. Apenas admins e managers podem adicionar membros.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiCreatedResponse({
    description: 'Team member successfully added',
    type: TeamMemberResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input or executor not found',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Team not found',
  })
  async addMember(
    @Param('id') teamId: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    const result = await this.addTeamMemberService.execute({
      teamId,
      userId: addTeamMemberDto.userId,
    });

    return TeamMemberResponseDto.fromDomain(result.teamUser);
  }

  @Delete(':id/members/:memberId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove an executor from a team',
    description:
      'Remove um executor da equipe. Apenas admins e managers podem remover membros.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'memberId',
    description: 'ID do membro da equipe (TeamUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Team member successfully removed',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Team member not found',
  })
  async removeMember(@Param('memberId') memberId: string): Promise<void> {
    await this.removeTeamMemberService.execute({ id: memberId });
  }

  @Get(':id/members')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List members of a team',
    description:
      'Lista todos os membros (executores) de uma equipe. Apenas admins e managers podem listar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Team members successfully retrieved',
    type: [TeamMemberResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Team not found',
  })
  async listMembers(
    @Param('id') teamId: string,
  ): Promise<TeamMemberResponseDto[]> {
    const result = await this.listTeamMembersService.execute({ teamId });

    return result.members.map((member) =>
      TeamMemberResponseDto.fromDomain(member),
    );
  }

  @Get(':id/responsibles')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EXECUTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List possible responsibles for a team',
    description:
      'Retorna os possíveis responsáveis por ações de uma equipe (gestor da equipe + executores membros ativos da equipe).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Team responsibles successfully retrieved',
    type: [EmployeeResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Team not found',
  })
  async listResponsibles(
    @Param('id') teamId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmployeeResponseDto[]> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new EntityNotFoundException('Equipe', teamId);
    }

    // Todos funcionários ativos da empresa com dados de usuário
    const companyUsers =
      await this.companyUserRepository.findByCompanyIdAndStatus(
        team.companyId,
        CompanyUserStatus.ACTIVE,
      );

    // Membros executores da equipe
    const teamUsers = await this.teamUserRepository.findByTeamId(teamId);
    const executorUserIds = new Set(teamUsers.map((m) => m.userId));

    // Regras por papel:
    // - ADMIN: pode ver gestor + executores da equipe (como antes)
    // - MANAGER: apenas se for gestor da equipe; vê gestor + executores da equipe
    // - EXECUTOR: pode criar ações apenas para si; retorna somente o próprio registro

    if (user.role === UserRole.MANAGER) {
      if (team.managerId !== user.sub) {
        // Oculta existência de equipes onde não é gestor
        throw new EntityNotFoundException('Equipe', teamId);
      }
    }

    if (user.role === UserRole.EXECUTOR) {
      // Executor só pode ser responsável por ações dele mesmo
      const selfCompanyUser = companyUsers.find(
        (cu) => cu.userId === user.sub && cu.role === UserRole.EXECUTOR,
      );

      if (!selfCompanyUser) {
        throw new EntityNotFoundException('Membro da empresa', user.sub);
      }

      const isMemberOfTeam = executorUserIds.has(user.sub);
      if (!isMemberOfTeam) {
        // Executor não pertence a esta equipe
        throw new EntityNotFoundException('Membro da equipe', user.sub);
      }

      return [EmployeeResponseDto.fromDomain(selfCompanyUser)];
    }

    const responsibles = companyUsers.filter((cu) => {
      // Gestor da equipe sempre pode ser responsável
      if (cu.userId === team.managerId) {
        return true;
      }

      // Executores que fazem parte da equipe
      if (cu.role === UserRole.EXECUTOR && executorUserIds.has(cu.userId)) {
        return true;
      }

      return false;
    });

    return responsibles.map((cu) => EmployeeResponseDto.fromDomain(cu));
  }

  @Get(':id/available-executors')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List available executors for a team',
    description:
      'Lista executores ativos disponíveis de uma empresa para adicionar em uma equipe específica. Usa as mesmas regras de disponibilidade do endpoint de executores por empresa, considerando a equipe atual.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da equipe',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Available executors for team successfully retrieved',
    type: TeamMemberResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Team not found',
  })
  async listAvailableExecutors(
    @Param('id') teamId: string,
  ): Promise<unknown[]> {
    const result = await this.listAvailableExecutorsForTeamService.execute({
      teamId,
    });

    return result.executors;
  }
}

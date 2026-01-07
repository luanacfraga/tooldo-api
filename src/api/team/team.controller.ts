import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { Roles } from '@/api/auth/decorators/roles.decorator';
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
import { DomainValidationException } from '@/core/domain/shared/exceptions/domain.exception';
import { UserRole } from '@/core/domain/shared/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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

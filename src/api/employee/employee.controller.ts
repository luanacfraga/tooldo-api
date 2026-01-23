import { Public } from '@/api/auth/decorators/public.decorator';
import { Roles } from '@/api/auth/decorators/roles.decorator';
import { PaginatedResponseDto } from '@/api/shared/dto/paginated-response.dto';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { AcceptInviteService } from '@/application/services/employee/accept-invite.service';
import { ActivateEmployeeService } from '@/application/services/employee/activate-employee.service';
import { ChangeEmployeeRoleService } from '@/application/services/employee/change-employee-role.service';
import { InviteEmployeeService } from '@/application/services/employee/invite-employee.service';
import { ListEmployeesService } from '@/application/services/employee/list-employees.service';
import { ListExecutorsService } from '@/application/services/employee/list-executors.service';
import { RemoveEmployeeService } from '@/application/services/employee/remove-employee.service';
import { RemoveEmployeeWithTransferService } from '@/application/services/employee/remove-employee-with-transfer.service';
import { ResendInviteService } from '@/application/services/employee/resend-invite.service';
import { SuspendEmployeeService } from '@/application/services/employee/suspend-employee.service';
import { UpdateEmployeeService } from '@/application/services/employee/update-employee.service';
import { UserRole } from '@/core/domain/shared/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AcceptInviteByTokenDto } from './dto/accept-invite-by-token.dto';
import { ChangeEmployeeRoleDto } from './dto/change-employee-role.dto';
import {
  EmployeeResponseDto,
  type CompanyUserWithUser,
} from './dto/employee-response.dto';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.dto';
import { RemoveEmployeeWithTransferDto } from './dto/remove-employee-with-transfer.dto';
import { RemoveEmployeeWithTransferResponseDto } from './dto/remove-employee-with-transfer-response.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly inviteEmployeeService: InviteEmployeeService,
    private readonly acceptInviteService: AcceptInviteService,
    private readonly listEmployeesService: ListEmployeesService,
    private readonly listExecutorsService: ListExecutorsService,
    private readonly suspendEmployeeService: SuspendEmployeeService,
    private readonly activateEmployeeService: ActivateEmployeeService,
    private readonly removeEmployeeService: RemoveEmployeeService,
    private readonly removeEmployeeWithTransferService: RemoveEmployeeWithTransferService,
    private readonly resendInviteService: ResendInviteService,
    private readonly changeEmployeeRoleService: ChangeEmployeeRoleService,
    private readonly updateEmployeeService: UpdateEmployeeService,
  ) {}

  @Post('invite')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Invite an employee to a company',
    description:
      'Convida um funcionário para a empresa. Valida limites do plano e cria o usuário se não existir. Apenas admins e managers podem convidar.',
  })
  @ApiCreatedResponse({
    description: 'Employee successfully invited',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input or limit exceeded',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company, subscription or plan not found',
  })
  async invite(
    @Body() inviteEmployeeDto: InviteEmployeeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EmployeeResponseDto> {
    const invitedById = req.user?.sub ?? 'temp-admin-id';

    const result = await this.inviteEmployeeService.execute({
      ...inviteEmployeeDto,
      invitedById,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

  @Public()
  @Post('accept-invite-by-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept an employee invitation by JWT token',
    description:
      'Aceita um convite de funcionário usando o token JWT recebido por email. Atualiza o usuário e marca o convite como aceito.',
  })
  @ApiOkResponse({
    description: 'Invite successfully accepted',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid token or invite already accepted',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Invite not found',
  })
  async acceptInviteByToken(
    @Body() acceptInviteByTokenDto: AcceptInviteByTokenDto,
  ): Promise<EmployeeResponseDto> {
    const result = await this.acceptInviteService.execute({
      companyUserId: '',
      ...acceptInviteByTokenDto,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

  @Get('company/:companyId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List employees of a company',
    description:
      'Lista todos os funcionários de uma empresa. Pode filtrar por status. Apenas admins e managers podem listar.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Employees successfully retrieved',
    type: PaginatedResponseDto<EmployeeResponseDto>,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async list(
    @Param('companyId') companyId: string,
    @Query() query: ListEmployeesQueryDto,
  ): Promise<PaginatedResponseDto<EmployeeResponseDto>> {
    const result = await this.listEmployeesService.execute({
      companyId,
      status: query.status,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      data: result.employees.map((employee) => {
        return EmployeeResponseDto.fromDomain(employee);
      }),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.totalPages > 0 && result.page < result.totalPages,
        hasPreviousPage: result.totalPages > 0 && result.page > 1,
      },
    };
  }

  @Get('company/:companyId/executors')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List available executors for team selection',
    description:
      'Lista executores disponíveis de uma empresa para adicionar em equipes. Retorna apenas executores ativos que ainda não estão em nenhuma equipe. Se excludeTeamId for fornecido, também exclui os membros dessa equipe. Apenas admins e managers podem listar.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID da empresa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'excludeTeamId',
    description: 'ID da equipe para excluir seus membros da lista (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @ApiOkResponse({
    description: 'Available executors successfully retrieved',
    type: [EmployeeResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async listExecutors(
    @Param('companyId') companyId: string,
    @Query('excludeTeamId') excludeTeamId?: string,
  ): Promise<EmployeeResponseDto[]> {
    const result = await this.listExecutorsService.execute({
      companyId,
      excludeTeamId,
    });

    return result.executors.map((executor) =>
      EmployeeResponseDto.fromDomain(executor),
    );
  }

  @Put(':id/suspend')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suspend an employee',
    description: 'Suspende um funcionário ativo. Apenas admins e managers.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do vínculo do funcionário (CompanyUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Employee successfully suspended',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Employee cannot be suspended',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Employee not found',
  })
  async suspend(@Param('id') id: string): Promise<EmployeeResponseDto> {
    const result = await this.suspendEmployeeService.execute({
      companyUserId: id,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

  @Put(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate a suspended employee',
    description: 'Ativa um funcionário suspenso. Apenas admins e managers.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do vínculo do funcionário (CompanyUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Employee successfully activated',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Employee cannot be activated',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Employee not found',
  })
  async activate(@Param('id') id: string): Promise<EmployeeResponseDto> {
    const result = await this.activateEmployeeService.execute({
      companyUserId: id,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change employee role',
    description:
      'Altera o cargo de um funcionário. Valida que o funcionário está ativo, não possui ações pendentes e não é gestor de equipes. Apenas admins e managers podem alterar cargos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do vínculo do funcionário (CompanyUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Employee role successfully changed',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request - Employee is not active, has pending actions, or is a manager of teams',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Employee not found',
  })
  async changeRole(
    @Param('id') id: string,
    @Body() changeRoleDto: ChangeEmployeeRoleDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EmployeeResponseDto> {
    const requestingUserId = req.user?.sub ?? 'temp-admin-id';

    const result = await this.changeEmployeeRoleService.execute({
      companyUserId: id,
      newRole: changeRoleDto.newRole,
      requestingUserId,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

  @Post(':id/resend-invite')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend employee invitation email',
    description:
      'Reenvia o email de convite para um funcionário com status INVITED. Apenas admins e managers.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do vínculo do funcionário (CompanyUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Invite email successfully resent',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Employee is not in INVITED status',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Employee not found',
  })
  async resendInvite(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<EmployeeResponseDto> {
    const invitedById = req.user?.sub ?? 'temp-admin-id';

    const result = await this.resendInviteService.execute({
      companyUserId: id,
      invitedById,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update employee data',
    description:
      'Atualiza dados do funcionário (nome, telefone, documento, posição, notas). Permite edição mesmo quando está em fase de convite. Apenas admins e managers.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do vínculo do funcionário (CompanyUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Employee successfully updated',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input or employee cannot be updated',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Employee not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const result = await this.updateEmployeeService.execute({
      companyUserId: id,
      firstName: updateEmployeeDto.firstName,
      lastName: updateEmployeeDto.lastName,
      email: updateEmployeeDto.email,
      phone: updateEmployeeDto.phone,
      document: updateEmployeeDto.document,
      position: updateEmployeeDto.position,
      notes: updateEmployeeDto.notes,
      role: updateEmployeeDto.role,
    });

    // Inclui os dados do usuário atualizado na resposta
    // Criamos um objeto compatível com CompanyUserWithUser
    const companyUserWithUser = {
      ...result.companyUser,
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        phone: result.user.phone || '',
        document: result.user.document || '',
        role: result.user.role,
        initials: result.user.initials,
      },
    } as CompanyUserWithUser;

    return EmployeeResponseDto.fromDomain(companyUserWithUser);
  }

  @Delete(':id/transfer')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove employee with action transfer',
    description:
      'Remove um funcionário da empresa e transfere automaticamente suas ações pendentes (TODO e IN_PROGRESS) para outro responsável. Apenas admins e managers.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do vínculo do funcionário (CompanyUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Employee removed and actions transferred successfully',
    type: RemoveEmployeeWithTransferResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Bad Request - Employee cannot be removed or new responsible is invalid',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Employee or new responsible not found',
  })
  async removeWithTransfer(
    @Param('id') id: string,
    @Body() dto: RemoveEmployeeWithTransferDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RemoveEmployeeWithTransferResponseDto> {
    const currentUserId = req.user?.sub ?? '';

    const result = await this.removeEmployeeWithTransferService.execute({
      companyUserId: id,
      newResponsibleId: dto.newResponsibleId,
      currentUserId,
    });

    return result;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove an employee',
    description:
      'Remove um funcionário da empresa (soft delete). Apenas admins e managers.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do vínculo do funcionário (CompanyUser ID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Employee successfully removed',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Employee cannot be removed',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Employee not found',
  })
  async remove(@Param('id') id: string): Promise<EmployeeResponseDto> {
    const result = await this.removeEmployeeService.execute({
      companyUserId: id,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }
}

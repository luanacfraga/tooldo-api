import { Roles } from '@/api/auth/decorators/roles.decorator';
import { AcceptInviteService } from '@/application/services/employee/accept-invite.service';
import { ActivateEmployeeService } from '@/application/services/employee/activate-employee.service';
import { InviteEmployeeService } from '@/application/services/employee/invite-employee.service';
import { ListEmployeesService } from '@/application/services/employee/list-employees.service';
import { RemoveEmployeeService } from '@/application/services/employee/remove-employee.service';
import { SuspendEmployeeService } from '@/application/services/employee/suspend-employee.service';
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
  ApiTags,
} from '@nestjs/swagger';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { AcceptInviteByTokenDto } from './dto/accept-invite-by-token.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { InviteEmployeeDto } from './dto/invite-employee.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly inviteEmployeeService: InviteEmployeeService,
    private readonly acceptInviteService: AcceptInviteService,
    private readonly listEmployeesService: ListEmployeesService,
    private readonly suspendEmployeeService: SuspendEmployeeService,
    private readonly activateEmployeeService: ActivateEmployeeService,
    private readonly removeEmployeeService: RemoveEmployeeService,
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
    @Req() req: any,
  ): Promise<EmployeeResponseDto> {
    // In a real implementation, get invitedById from authenticated user
    const invitedById = req.user?.id ?? 'temp-admin-id';

    const result = await this.inviteEmployeeService.execute({
      ...inviteEmployeeDto,
      invitedById,
    });

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept an employee invitation (deprecated)',
    description:
      'Aceita um convite de funcionário. Atualiza o usuário e marca o convite como aceito. Use accept-invite-by-token para aceitar via JWT.',
    deprecated: true,
  })
  @ApiOkResponse({
    description: 'Invite successfully accepted',
    type: EmployeeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input or invite already accepted',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Invite not found',
  })
  async acceptInvite(
    @Body() acceptInviteDto: AcceptInviteDto,
  ): Promise<EmployeeResponseDto> {
    const result = await this.acceptInviteService.execute(acceptInviteDto);

    return EmployeeResponseDto.fromDomain(result.companyUser);
  }

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
      companyUserId: '', // Will be extracted from token
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
    type: [EmployeeResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company not found',
  })
  async list(
    @Param('companyId') companyId: string,
    @Query() query: ListEmployeesQueryDto,
  ): Promise<EmployeeResponseDto[]> {
    const result = await this.listEmployeesService.execute({
      companyId,
      status: query.status,
    });

    return result.employees.map((employee) =>
      EmployeeResponseDto.fromDomain(employee),
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

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove an employee',
    description: 'Remove um funcionário da empresa (soft delete). Apenas admins e managers.',
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

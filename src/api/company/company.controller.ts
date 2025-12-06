import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { Roles } from '@/api/auth/decorators/roles.decorator';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { CreateCompanyService } from '@/application/services/company/create-company.service';
import { DeleteCompanyService } from '@/application/services/company/delete-company.service';
import { ListCompaniesService } from '@/application/services/company/list-companies.service';
import { UpdateCompanyService } from '@/application/services/company/update-company.service';
import { Company } from '@/core/domain/company/company.entity';
import { CompanyUserStatus, UserRole } from '@/core/domain/shared/enums';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import type { CompanyUserRepository } from '@/core/ports/repositories/company-user.repository';
import { Inject } from '@nestjs/common';
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
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Company')
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly createCompanyService: CreateCompanyService,
    private readonly listCompaniesService: ListCompaniesService,
    private readonly updateCompanyService: UpdateCompanyService,
    private readonly deleteCompanyService: DeleteCompanyService,
    @Inject('CompanyUserRepository')
    private readonly companyUserRepository: CompanyUserRepository,
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EXECUTOR, UserRole.CONSULTANT)
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

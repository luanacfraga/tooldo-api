import { Roles } from '@/api/auth/decorators/roles.decorator';
import { UserRole } from '@/core/domain/shared/enums';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
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

class ObjectiveResponseDto {
  id!: string;
  companyId!: string;
  teamId!: string;
  title!: string;
  dueDate!: string | null;
  createdAt!: string;
  updatedAt!: string;
}

class CreateObjectiveDto {
  companyId!: string;
  teamId!: string;
  title!: string;
  dueDate?: string | null;
}

class UpdateObjectiveDto {
  title?: string;
  dueDate?: string | null;
}

@ApiTags('Objectives')
@Controller('objectives')
export class ObjectiveController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List objectives by company and team',
    description:
      'Retorna os objetivos cadastrados para uma empresa e, opcionalmente, filtrados por equipe.',
  })
  @ApiQuery({
    name: 'companyId',
    description: 'ID da empresa',
    required: true,
  })
  @ApiQuery({
    name: 'teamId',
    description: 'ID da equipe (opcional)',
    required: false,
  })
  @ApiOkResponse({
    description: 'Objectives successfully retrieved',
    type: [ObjectiveResponseDto],
  })
  async list(
    @Query('companyId') companyId: string,
    @Query('teamId') teamId?: string,
  ): Promise<ObjectiveResponseDto[]> {
    if (!companyId) {
      throw new Error('companyId é obrigatório');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = this.prisma as any;
    const objectives = await prismaAny.objective.findMany({
      where: {
        companyId,
        ...(teamId ? { teamId } : {}),
      },
      orderBy: [
        {
          dueDate: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return objectives.map((o: any) => ({
      id: o.id,
      companyId: o.companyId,
      teamId: o.teamId,
      title: o.title,
      dueDate: o.dueDate?.toISOString().slice(0, 10) ?? null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new objective',
    description:
      'Cria um novo objetivo vinculado a uma empresa e equipe. Apenas admins e managers podem criar.',
  })
  @ApiCreatedResponse({
    description: 'Objective successfully created',
    type: ObjectiveResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid input',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Company or team not found',
  })
  async create(@Body() dto: CreateObjectiveDto): Promise<ObjectiveResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = this.prisma as any;
    const company = await prismaAny.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new EntityNotFoundException('Empresa', dto.companyId);
    }

    const team = await prismaAny.team.findUnique({
      where: { id: dto.teamId },
    });
    if (team?.companyId !== dto.companyId) {
      throw new EntityNotFoundException('Equipe', dto.teamId);
    }

    const created = await prismaAny.objective.create({
      data: {
        companyId: dto.companyId,
        teamId: dto.teamId,
        title: dto.title.trim(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });

    return {
      id: created.id,
      companyId: created.companyId,
      teamId: created.teamId,
      title: created.title,
      dueDate: created.dueDate?.toISOString().slice(0, 10) ?? null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an objective',
    description: 'Atualiza título e/ou prazo de um objetivo existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do objetivo',
  })
  @ApiOkResponse({
    description: 'Objective successfully updated',
    type: ObjectiveResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Objective not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateObjectiveDto,
  ): Promise<ObjectiveResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = this.prisma as any;
    const existing = await prismaAny.objective.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new EntityNotFoundException('Objetivo', id);
    }

    const updated = await prismaAny.objective.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.dueDate !== undefined
          ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
          : {}),
      },
    });

    return {
      id: updated.id,
      companyId: updated.companyId,
      teamId: updated.teamId,
      title: updated.title,
      dueDate: updated.dueDate?.toISOString().slice(0, 10) ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an objective',
    description: 'Remove um objetivo existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do objetivo',
  })
  @ApiOkResponse({
    description: 'Objective successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'Not Found - Objective not found',
  })
  async delete(@Param('id') id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = this.prisma as any;
    const existing = await prismaAny.objective.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new EntityNotFoundException('Objetivo', id);
    }

    await prismaAny.objective.delete({ where: { id } });
  }
}

import { BlockActionService } from '@/application/services/action/block-action.service';
import { CreateActionService } from '@/application/services/action/create-action.service';
import { DeleteActionService } from '@/application/services/action/delete-action.service';
import { GetActionService } from '@/application/services/action/get-action.service';
import { GenerateActionPlanService } from '@/application/services/action/generate-action-plan.service';
import { ListActionsService } from '@/application/services/action/list-actions.service';
import { MoveActionService } from '@/application/services/action/move-action.service';
import { UpdateActionService } from '@/application/services/action/update-action.service';
import { AddChecklistItemService } from '@/application/services/checklist/add-checklist-item.service';
import { ToggleChecklistItemService } from '@/application/services/checklist/toggle-checklist-item.service';
import { ReorderChecklistItemsService } from '@/application/services/checklist/reorder-checklist-items.service';
import { ActionPriority, ActionStatus } from '@/core/domain/shared/enums';
import { UnblockActionService } from '@/application/services/action/unblock-action.service';
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
  Request,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ActionResponseDto } from './dto/action-response.dto';
import { ActionSuggestionResponseDto } from './dto/action-suggestion-response.dto';
import { AddChecklistItemDto } from './dto/add-checklist-item.dto';
import { BlockActionDto } from './dto/block-action.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { GenerateActionPlanDto } from './dto/generate-action-plan.dto';
import { ListActionsQueryDto } from './dto/list-actions.dto';
import { MoveActionDto } from './dto/move-action.dto';
import { ReorderChecklistItemsDto } from './dto/reorder-checklist-items.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { JwtPayload } from '@/application/services/auth/auth.service';
import { Request as ExpressRequest } from 'express';
import { ChecklistItem } from '@/core/domain/action/checklist-item.entity';
import { PaginatedResponseDto } from '@/api/shared/dto/paginated-response.dto';

type RequestWithUser = ExpressRequest & { user: JwtPayload };

@ApiTags('Actions')
@ApiBearerAuth()
@Controller('actions')
export class ActionController {
  constructor(
    private readonly createActionService: CreateActionService,
    private readonly getActionService: GetActionService,
    private readonly listActionsService: ListActionsService,
    private readonly updateActionService: UpdateActionService,
    private readonly deleteActionService: DeleteActionService,
    private readonly moveActionService: MoveActionService,
    private readonly blockActionService: BlockActionService,
    private readonly unblockActionService: UnblockActionService,
    private readonly generateActionPlanService: GenerateActionPlanService,
    private readonly addChecklistItemService: AddChecklistItemService,
    private readonly toggleChecklistItemService: ToggleChecklistItemService,
    private readonly reorderChecklistItemsService: ReorderChecklistItemsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova ação',
    description: 'Cria uma nova ação no plano de ação',
  })
  @ApiCreatedResponse({
    description: 'Ação criada com sucesso',
    type: ActionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async create(
    @Body() dto: CreateActionDto,
    @Request() req: RequestWithUser,
  ): Promise<ActionResponseDto> {
    const result = await this.createActionService.execute({
      ...dto,
      creatorId: req.user.sub,
    });
    return ActionResponseDto.fromDomain(result.action);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar ações',
    description:
      'Lista ações filtradas por empresa, equipe, responsável ou status',
  })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  @ApiQuery({ name: 'responsibleId', required: false, type: String })
  @ApiQuery({ name: 'creatorId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ActionStatus })
  @ApiQuery({ name: 'statuses', required: false, enum: ActionStatus, isArray: true })
  @ApiQuery({ name: 'priority', required: false, enum: ActionPriority })
  @ApiQuery({ name: 'isLate', required: false, type: Boolean })
  @ApiQuery({ name: 'isBlocked', required: false, type: Boolean })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Busca por título ou descrição (case-insensitive)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Lista de ações',
    type: PaginatedResponseDto<ActionResponseDto>,
  })
  async list(
    @Query() query: ListActionsQueryDto,
  ): Promise<PaginatedResponseDto<ActionResponseDto>> {
    const result = await this.listActionsService.execute({
      companyId: query.companyId,
      teamId: query.teamId,
      responsibleId: query.responsibleId,
      creatorId: query.creatorId,
      status: query.status,
      statuses: query.statuses,
      priority: query.priority,
      isLate: query.isLate,
      isBlocked: query.isBlocked,
      q: query.q,
      page: query.page,
      limit: query.limit,
    });
    return {
      data: result.results.map((r) =>
        ActionResponseDto.fromDomain(
          r.action,
          r.checklistItems,
          r.kanbanOrder,
          r.responsible,
        ),
      ),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar ação por id',
    description: 'Retorna uma ação com checklist, kanbanOrder e responsável (quando disponível)',
  })
  @ApiOkResponse({
    description: 'Ação encontrada',
    type: ActionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async getById(@Param('id') id: string): Promise<ActionResponseDto> {
    const result = await this.getActionService.execute({ actionId: id });
    return ActionResponseDto.fromDomain(
      result.result.action,
      result.result.checklistItems,
      result.result.kanbanOrder,
      result.result.responsible,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar ação',
    description: 'Atualiza uma ação existente',
  })
  @ApiOkResponse({
    description: 'Ação atualizada com sucesso',
    type: ActionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateActionDto,
  ): Promise<ActionResponseDto> {
    const result = await this.updateActionService.execute({
      actionId: id,
      ...dto,
    });
    return ActionResponseDto.fromDomain(result.action);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deletar ação',
    description: 'Remove uma ação (soft delete)',
  })
  @ApiOkResponse({
    description: 'Ação deletada com sucesso',
    type: ActionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async delete(@Param('id') id: string): Promise<ActionResponseDto> {
    const result = await this.deleteActionService.execute({ actionId: id });
    return ActionResponseDto.fromDomain(result.action);
  }

  @Patch(':id/move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mover ação no kanban',
    description:
      'Move a ação para um novo status e posição, registrando o movimento',
  })
  @ApiOkResponse({
    description: 'Ação movida com sucesso',
    type: ActionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async move(
    @Param('id') id: string,
    @Body() dto: MoveActionDto,
    @Request() req: RequestWithUser,
  ): Promise<ActionResponseDto> {
    const result = await this.moveActionService.execute({
      actionId: id,
      toStatus: dto.toStatus,
      position: dto.position,
      movedById: req.user.sub,
      notes: dto.notes,
    });
    return ActionResponseDto.fromDomain(
      result.action,
      undefined,
      result.kanbanOrder,
    );
  }

  @Patch(':id/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bloquear ação',
    description: 'Bloqueia uma ação com um motivo específico',
  })
  @ApiOkResponse({
    description: 'Ação bloqueada com sucesso',
    type: ActionResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async block(
    @Param('id') id: string,
    @Body() dto: BlockActionDto,
  ): Promise<ActionResponseDto> {
    const result = await this.blockActionService.execute({
      actionId: id,
      reason: dto.reason,
    });
    return ActionResponseDto.fromDomain(result.action);
  }

  @Patch(':id/unblock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desbloquear ação',
    description: 'Remove o bloqueio de uma ação',
  })
  @ApiOkResponse({
    description: 'Ação desbloqueada com sucesso',
    type: ActionResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async unblock(@Param('id') id: string): Promise<ActionResponseDto> {
    const result = await this.unblockActionService.execute({ actionId: id });
    return ActionResponseDto.fromDomain(result.action);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gerar plano de ação com IA',
    description:
      'Gera sugestões de ações usando IA baseado no objetivo informado',
  })
  @ApiOkResponse({
    description: 'Plano de ação gerado com sucesso',
    type: [ActionSuggestionResponseDto],
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  async generate(
    @Body() dto: GenerateActionPlanDto,
  ): Promise<ActionSuggestionResponseDto[]> {
    const result = await this.generateActionPlanService.execute(dto);
    return result.suggestions.map((suggestion) =>
      ActionSuggestionResponseDto.fromDomain(suggestion),
    );
  }

  @Post(':id/checklist')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Adicionar item à checklist',
    description: 'Adiciona um novo item à checklist da ação',
  })
  @ApiCreatedResponse({
    description: 'Item adicionado com sucesso',
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async addChecklistItem(
    @Param('id') actionId: string,
    @Body() dto: AddChecklistItemDto,
  ): Promise<ChecklistItem> {
    const result = await this.addChecklistItemService.execute({
      actionId,
      ...dto,
    });
    return result.item;
  }

  @Patch('checklist/:itemId/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Alternar status do item da checklist',
    description: 'Marca/desmarca um item da checklist como completo',
  })
  @ApiOkResponse({
    description: 'Status do item alterado com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Item não encontrado' })
  async toggleChecklistItem(
    @Param('itemId') itemId: string,
  ): Promise<ChecklistItem> {
    console.log('[TOGGLE CONTROLLER] Received request for itemId:', itemId);
    const result = await this.toggleChecklistItemService.execute({ itemId });
    console.log('[TOGGLE CONTROLLER] Toggle successful, item:', result.item.id, 'isCompleted:', result.item.isCompleted);
    return result.item;
  }

  @Patch(':id/checklist/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reordenar itens da checklist',
    description: 'Reordena os itens da checklist da ação',
  })
  @ApiOkResponse({
    description: 'Itens reordenados com sucesso',
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiNotFoundResponse({ description: 'Ação não encontrada' })
  async reorderChecklistItems(
    @Param('id') actionId: string,
    @Body() dto: ReorderChecklistItemsDto,
  ): Promise<ChecklistItem[]> {
    const result = await this.reorderChecklistItemsService.execute({
      actionId,
      itemIds: dto.itemIds,
    });
    return result.items;
  }
}

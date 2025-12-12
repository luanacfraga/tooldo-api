import { CreatePlanService } from '@/application/services/plan/create-plan.service';
import { ListPlansService } from '@/application/services/plan/list-plans.service';
import { UpdatePlanService } from '@/application/services/plan/update-plan.service';
import {
  Body,
  Controller,
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
  ApiTags,
} from '@nestjs/swagger';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@ApiTags('Plan')
@Controller('plan')
export class PlanController {
  constructor(
    private readonly createPlanService: CreatePlanService,
    private readonly listPlansService: ListPlansService,
    private readonly updatePlanService: UpdatePlanService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new plan',
    description: 'Creates a new plan with the specified limits and features.',
  })
  @ApiCreatedResponse({
    description: 'Plan successfully created.',
    type: PlanResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input.' })
  async create(@Body() dto: CreatePlanDto): Promise<PlanResponseDto> {
    const result = await this.createPlanService.execute(dto);
    return PlanResponseDto.fromDomain(result.plan);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all plans',
    description: 'Retrieves a list of all available plans.',
  })
  @ApiOkResponse({
    description: 'List of all plans',
    type: [PlanResponseDto],
  })
  async list(): Promise<PlanResponseDto[]> {
    const plans = await this.listPlansService.execute();
    return plans.map((plan) => PlanResponseDto.fromDomain(plan));
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a plan',
    description: 'Updates an existing plan with new values.',
  })
  @ApiOkResponse({
    description: 'Plan successfully updated.',
    type: PlanResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input.' })
  @ApiNotFoundResponse({ description: 'Plan not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: Omit<UpdatePlanDto, 'id'>,
  ): Promise<PlanResponseDto> {
    const plan = await this.updatePlanService.execute({
      ...dto,
      id,
    });
    return PlanResponseDto.fromDomain(plan);
  }
}

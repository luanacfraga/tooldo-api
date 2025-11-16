import { CreatePlanService } from '@/application/services/plan/create-plan.service';
import { ListPlansService } from '@/application/services/plan/list-plans.service';
import { UpdatePlanService } from '@/application/services/plan/update-plan.service';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
  @ApiCreatedResponse({
    description: 'Plan successfully created.',
    type: PlanResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input.' })
  async create(@Body() dto: CreatePlanDto): Promise<PlanResponseDto> {
    const plan = await this.createPlanService.execute(dto);
    return PlanResponseDto.fromDomain(plan);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of all plans',
    type: [PlanResponseDto],
  })
  async list(): Promise<PlanResponseDto[]> {
    const plans = await this.listPlansService.execute();
    return plans.map((plan) => PlanResponseDto.fromDomain(plan));
  }

  @Put(':id')
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

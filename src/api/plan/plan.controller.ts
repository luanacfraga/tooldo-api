import { CreatePlanService } from '@/application/services/create-plan';
import { Plan } from '@/core/domain/plan.entity';
import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';

@ApiTags('Plans')
@Controller('plans')
export class PlanController {
  constructor(private readonly createPlanService: CreatePlanService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Plan successfully created.',
    type: PlanResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input.' })
  async create(@Body() dto: CreatePlanDto): Promise<Plan> {
    return await this.createPlanService.execute(dto);
  }
}

import { CreateCompanyService } from '@/application/services/company/create-company.service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CompanyResponseDto } from './dto/company-response.dto';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('Company')
@Controller('companies')
export class CompanyController {
  constructor(private readonly createCompanyService: CreateCompanyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new company for an admin',
    description:
      'Cria uma nova empresa para um administrador. Valida se o admin existe, se tem uma assinatura ativa e se não excedeu o limite de empresas do plano.',
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
  ): Promise<CompanyResponseDto> {
    const result = await this.createCompanyService.execute(createCompanyDto);

    return CompanyResponseDto.fromDomain(result.company);
  }
}

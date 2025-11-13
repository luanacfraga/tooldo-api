import { AuthService } from '@/application/services/auth.service';
import { RegisterAdminService } from '@/application/services/register-admin.service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminResponseDto } from './dto/register-admin-response.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerAdminService: RegisterAdminService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new admin with company and subscription',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin successfully registered',
    type: RegisterAdminResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Email, phone or document already registered',
  })
  @ApiResponse({
    status: 404,
    description: 'Default plan not found',
  })
  async register(
    @Body() registerDto: RegisterAdminDto,
  ): Promise<RegisterAdminResponseDto> {
    const result = await this.registerAdminService.execute(registerDto);

    const publicUser = result.user.toPublic();

    return {
      user: {
        ...publicUser,
        documentType: publicUser.documentType,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        description: result.company.description,
        adminId: result.company.adminId,
      },
      subscription: {
        id: result.subscription.id,
        adminId: result.subscription.adminId,
        planId: result.subscription.planId,
        startedAt: result.subscription.startedAt,
        isActive: result.subscription.isActive,
      },
    };
  }
}

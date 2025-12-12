import { CompanyMapper } from '@/application/mappers/company.mapper';
import { SubscriptionMapper } from '@/application/mappers/subscription.mapper';
import { UserMapper } from '@/application/mappers/user.mapper';
import { RegisterAdminService } from '@/application/services/admin/register-admin.service';
import { RegisterMasterService } from '@/application/services/admin/register-master.service';
import { AuthService } from '@/application/services/auth/auth.service';
import { ForgotPasswordService } from '@/application/services/auth/forgot-password.service';
import { ResetPasswordService } from '@/application/services/auth/reset-password.service';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminResponseDto } from './dto/register-admin-response.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RegisterMasterResponseDto } from './dto/register-master-response.dto';
import { RegisterMasterDto } from './dto/register-master.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerAdminService: RegisterAdminService,
    private readonly registerMasterService: RegisterMasterService,
    private readonly authService: AuthService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly resetPasswordService: ResetPasswordService,
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

    return {
      user: UserMapper.toResponseDto(result.user),
      company: CompanyMapper.toResponseDto(result.company),
      subscription: SubscriptionMapper.toResponseDto(result.subscription),
    };
  }

  @Public()
  @Post('register-master')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new master user',
    description:
      'Cria um usuário master responsável por criar e editar planos e limites',
  })
  @ApiResponse({
    status: 201,
    description: 'Master user successfully registered',
    type: RegisterMasterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Email, phone or document already registered',
  })
  async registerMaster(
    @Body() registerDto: RegisterMasterDto,
  ): Promise<RegisterMasterResponseDto> {
    const result = await this.registerMasterService.execute(registerDto);

    return {
      user: UserMapper.toResponseDto(result.user),
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Solicita a recuperação de senha. Envia um email com link para redefinir a senha.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if user exists',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return await this.forgotPasswordService.execute({
      email: forgotPasswordDto.email,
    });
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description:
      'Redefine a senha usando o token recebido por email. O token expira em 1 hora.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return await this.resetPasswordService.execute({
      token: resetPasswordDto.token,
      newPassword: resetPasswordDto.newPassword,
    });
  }
}

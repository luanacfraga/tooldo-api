import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthService } from '@/application/services/auth/auth.service';
import { ForgotPasswordService } from '@/application/services/auth/forgot-password.service';
import { ResetPasswordService } from '@/application/services/auth/reset-password.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';

@Module({
  imports: [
    DatabaseModule,
    SharedServicesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '7d');
        return {
          secret: configService.get<string>(
            'JWT_SECRET',
            'your-secret-key-change-me',
          ),
          signOptions: {
            expiresIn: expiresIn as StringValue | number,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, ForgotPasswordService, ResetPasswordService],
  exports: [AuthService, ForgotPasswordService, ResetPasswordService],
})
export class AuthApplicationModule {}

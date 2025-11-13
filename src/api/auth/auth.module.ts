import { AuthService } from '@/application/services/auth.service';
import { RegisterAdminService } from '@/application/services/register-admin.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    SharedServicesModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'your-secret-key-change-me',
      signOptions: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [RegisterAdminService, AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}

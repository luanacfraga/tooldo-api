import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminApplicationModule } from '@/application/modules/admin.module';
import { AuthApplicationModule } from '@/application/modules/auth.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    AuthApplicationModule,
    AdminApplicationModule,
    PassportModule,
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
            expiresIn: expiresIn as string | number,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [AuthApplicationModule, JwtStrategy, PassportModule],
})
export class AuthModule {}

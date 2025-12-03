import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '@/application/services/auth/auth.service';
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
            expiresIn: expiresIn as string | number,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthApplicationModule {}

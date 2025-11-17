import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security - Helmet (instalar: npm install helmet)
  // app.use(helmet());

  // CORS
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS');
  
  let allowedOrigins: string[] | boolean;
  
  if (nodeEnv === 'production') {
    // Em produção, usar apenas origens permitidas
    allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv.split(',').map((origin) => origin.trim())
      : [];
  } else {
    // Em desenvolvimento, permitir todas as origens ou usar a variável de ambiente
    allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv.split(',').map((origin) => origin.trim())
      : true; // Permite todas as origens em desenvolvimento
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras
      transform: true, // Transforma automaticamente tipos
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger (apenas em desenvolvimento)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Weedu API')
      .setDescription('API documentation for Weedu')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
}
void bootstrap();

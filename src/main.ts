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

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS');

  let allowedOrigins: string[] | boolean;

  if (nodeEnv === 'production') {
    allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : [];
    if (Array.isArray(allowedOrigins) && allowedOrigins.length === 0) {
      logger.warn(
        '⚠️  WARNING: ALLOWED_ORIGINS not configured in production! CORS will block all requests.',
      );
    }
  } else {
    // Em desenvolvimento, se não houver ALLOWED_ORIGINS definido, permite todas as origens
    allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : true;
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  logger.log(
    `CORS configured - Allowed origins: ${
      typeof allowedOrigins === 'boolean'
        ? allowedOrigins
          ? 'All origins (development)'
          : 'None'
        : allowedOrigins.join(', ') || 'None'
    }`,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Tooldo API')
      .setDescription('API documentation for Tooldo')
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

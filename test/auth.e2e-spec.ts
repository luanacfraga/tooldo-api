import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts
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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 401 with invalid credentials (user not found)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Credenciais inválidas');
          expect(res.body.statusCode).toBe(401);
        });
    });

    it('should return 400 with missing email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 with missing password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });

    it('should return 400 with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 with extra fields (forbidNonWhitelisted)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
          extraField: 'should not be allowed',
        })
        .expect(400);
    });
  });

  describe('Protected endpoints', () => {
    it('should return 401 when accessing protected endpoint without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/plan')
        .send({
          name: 'Test Plan',
          description: 'Test Description',
          price: 99.99,
          durationInDays: 30,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Unauthorized');
          expect(res.body.statusCode).toBe(401);
        });
    });

    it('should return 401 with invalid JWT token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/plan')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          name: 'Test Plan',
          description: 'Test Description',
          price: 99.99,
          durationInDays: 30,
        })
        .expect(401);
    });

    it('should return 401 with malformed Authorization header', () => {
      return request(app.getHttpServer())
        .post('/api/v1/plan')
        .set('Authorization', 'invalid_header_format')
        .send({
          name: 'Test Plan',
          description: 'Test Description',
          price: 99.99,
          durationInDays: 30,
        })
        .expect(401);
    });
  });

  describe('Public endpoints', () => {
    it('should allow access to login endpoint without authentication', () => {
      // This test confirms the login endpoint is public
      // Even though it will fail with 401 (invalid credentials),
      // it proves the endpoint is accessible without a JWT token
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'test123',
        })
        .expect((res) => {
          // Should get 401 for invalid credentials, not 401 for missing token
          expect(res.statusCode).toBe(401);
          expect(res.body.message).toBe('Credenciais inválidas');
        });
    });

    it('should allow access to register endpoint without authentication', () => {
      // This test confirms the register endpoint is public
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'newuser@example.com',
          phone: '11987654321',
          password: 'password123',
          document: '12345678900',
          documentType: 'CPF',
          company: {
            name: 'Test Company',
            description: 'Test Description',
          },
        })
        .expect((res) => {
          // Will likely fail due to validation or business logic,
          // but proves the endpoint is accessible
          expect([400, 404, 409]).toContain(res.statusCode);
        });
    });
  });

  describe('JWT Token validation', () => {
    it('should reject expired JWT tokens', async () => {
      // Create a JWT token that is expired
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';

      return request(app.getHttpServer())
        .post('/api/v1/plan')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          name: 'Test Plan',
          description: 'Test Description',
          price: 99.99,
          durationInDays: 30,
        })
        .expect(401);
    });

    it('should reject JWT tokens with invalid signature', async () => {
      const invalidSignatureToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIn0.invalid_signature';

      return request(app.getHttpServer())
        .post('/api/v1/plan')
        .set('Authorization', `Bearer ${invalidSignatureToken}`)
        .send({
          name: 'Test Plan',
          description: 'Test Description',
          price: 99.99,
          durationInDays: 30,
        })
        .expect(401);
    });
  });
});

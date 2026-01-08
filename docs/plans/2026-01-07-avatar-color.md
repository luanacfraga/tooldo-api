# Avatar Color Customization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to customize their avatar color by choosing from a predefined palette of 8 colors.

**Architecture:** Clean Architecture with NestJS - Create dedicated user module with service layer, DTOs for validation, and RESTful endpoints. Follow TDD approach with comprehensive tests.

**Tech Stack:** NestJS, Prisma, class-validator, Jest

---

## Task 1: Create Avatar Colors Constant

**Files:**
- Create: `src/shared/constants/avatar-colors.ts`

**Step 1: Create avatar colors constant file**

```typescript
export const AVATAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];
```

**Step 2: Verify file was created correctly**

Run: `cat src/shared/constants/avatar-colors.ts`
Expected: File contains the 8 colors

**Step 3: Commit**

```bash
git add src/shared/constants/avatar-colors.ts
git commit -m "feat: add avatar colors constant"
```

---

## Task 2: Create Update Avatar Color DTO

**Files:**
- Create: `src/api/user/dto/update-avatar-color.dto.ts`

**Step 1: Create user/dto directory**

```bash
mkdir -p src/api/user/dto
```

**Step 2: Create UpdateAvatarColorDto with validation**

```typescript
import { AVATAR_COLORS } from '@/shared/constants/avatar-colors';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateAvatarColorDto {
  @ApiProperty({
    description: 'Cor do avatar escolhida pelo usuário',
    example: '#3B82F6',
    enum: AVATAR_COLORS,
  })
  @IsString({ message: 'A cor do avatar deve ser uma string' })
  @IsIn(AVATAR_COLORS, {
    message: 'A cor do avatar deve ser uma das cores predefinidas',
  })
  avatarColor!: string;
}
```

**Step 3: Verify DTO was created**

Run: `cat src/api/user/dto/update-avatar-color.dto.ts`
Expected: File contains validation decorators

**Step 4: Commit**

```bash
git add src/api/user/dto/update-avatar-color.dto.ts
git commit -m "feat: add update avatar color DTO with validation"
```

---

## Task 3: Create Avatar Colors Response DTO

**Files:**
- Create: `src/api/user/dto/avatar-colors-response.dto.ts`

**Step 1: Create AvatarColorsResponseDto**

```typescript
import { AVATAR_COLORS } from '@/shared/constants/avatar-colors';
import { ApiProperty } from '@nestjs/swagger';

export class AvatarColorsResponseDto {
  @ApiProperty({
    description: 'Lista de cores disponíveis para o avatar',
    example: AVATAR_COLORS,
    type: [String],
  })
  colors!: readonly string[];

  static create(): AvatarColorsResponseDto {
    const dto = new AvatarColorsResponseDto();
    dto.colors = AVATAR_COLORS;
    return dto;
  }
}
```

**Step 2: Verify DTO was created**

Run: `cat src/api/user/dto/avatar-colors-response.dto.ts`
Expected: File contains static create method

**Step 3: Commit**

```bash
git add src/api/user/dto/avatar-colors-response.dto.ts
git commit -m "feat: add avatar colors response DTO"
```

---

## Task 4: Create Update User Avatar Color Service (TDD)

**Files:**
- Create: `src/application/services/user/update-user-avatar-color.service.spec.ts`
- Create: `src/application/services/user/update-user-avatar-color.service.ts`

**Step 1: Create user services directory**

```bash
mkdir -p src/application/services/user
```

**Step 2: Write failing test for service**

Create `src/application/services/user/update-user-avatar-color.service.spec.ts`:

```typescript
/* eslint-disable @typescript-eslint/unbound-method */
import { AVATAR_COLORS } from '@/shared/constants/avatar-colors';
import { User } from '@/core/domain/user/user.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserAvatarColorService } from './update-user-avatar-color.service';
import { DocumentType, UserRole, UserStatus } from '@/core/domain/shared/enums';

describe('UpdateUserAvatarColorService', () => {
  let service: UpdateUserAvatarColorService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUser = new User(
    mockUserId,
    'John',
    'Doe',
    'john@example.com',
    '+5511999999999',
    '12345678900',
    DocumentType.CPF,
    'hashedPassword',
    UserRole.EXECUTOR,
    UserStatus.ACTIVE,
    null,
    '#3B82F6',
    'JD',
  );

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByDocument: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserAvatarColorService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UpdateUserAvatarColorService>(
      UpdateUserAvatarColorService,
    );
    userRepository = module.get('UserRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should update user avatar color successfully', async () => {
      const newColor = '#10B981';
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockImplementation((user: User) =>
        Promise.resolve(user),
      );

      const result = await service.execute({
        userId: mockUserId,
        avatarColor: newColor,
      });

      expect(result).toBeInstanceOf(User);
      expect(result.avatarColor).toBe(newColor);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).toHaveBeenCalledTimes(1);
      const updateCall = userRepository.update.mock.calls[0][0];
      expect(updateCall).toBeInstanceOf(User);
      expect(updateCall.avatarColor).toBe(newColor);
    });

    it('should throw EntityNotFoundException when user does not exist', async () => {
      const newColor = '#10B981';
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.execute({
          userId: mockUserId,
          avatarColor: newColor,
        }),
      ).rejects.toThrow(EntityNotFoundException);
      await expect(
        service.execute({
          userId: mockUserId,
          avatarColor: newColor,
        }),
      ).rejects.toThrow(
        `Usuário com identificador '${mockUserId}' não foi encontrado(a)`,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should update to each of the predefined colors', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockImplementation((user: User) =>
        Promise.resolve(user),
      );

      for (const color of AVATAR_COLORS) {
        const result = await service.execute({
          userId: mockUserId,
          avatarColor: color,
        });

        expect(result.avatarColor).toBe(color);
      }

      expect(userRepository.update).toHaveBeenCalledTimes(AVATAR_COLORS.length);
    });

    it('should preserve other user properties when updating color', async () => {
      const newColor = '#EF4444';
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockImplementation((user: User) =>
        Promise.resolve(user),
      );

      const result = await service.execute({
        userId: mockUserId,
        avatarColor: newColor,
      });

      expect(result.id).toBe(mockUser.id);
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.email).toBe(mockUser.email);
      expect(result.phone).toBe(mockUser.phone);
      expect(result.document).toBe(mockUser.document);
      expect(result.initials).toBe(mockUser.initials);
      expect(result.avatarColor).toBe(newColor);
    });
  });
});
```

**Step 3: Run test to verify it fails**

Run: `pnpm test update-user-avatar-color.service.spec.ts`
Expected: FAIL - "Cannot find module './update-user-avatar-color.service'"

**Step 4: Create minimal service implementation**

Create `src/application/services/user/update-user-avatar-color.service.ts`:

```typescript
import { User } from '@/core/domain/user/user.entity';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import type { UserRepository } from '@/core/ports/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';

export interface UpdateUserAvatarColorInput {
  userId: string;
  avatarColor: string;
}

@Injectable()
export class UpdateUserAvatarColorService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserAvatarColorInput): Promise<User> {
    const existingUser = await this.userRepository.findById(input.userId);
    if (!existingUser) {
      throw new EntityNotFoundException('Usuário', input.userId);
    }

    const updatedUser = new User(
      existingUser.id,
      existingUser.firstName,
      existingUser.lastName,
      existingUser.email,
      existingUser.phone,
      existingUser.document,
      existingUser.documentType,
      existingUser.password,
      existingUser.role,
      existingUser.status,
      existingUser.profileImageUrl,
      input.avatarColor,
      existingUser.initials,
    );

    return this.userRepository.update(updatedUser);
  }
}
```

**Step 5: Run test to verify it passes**

Run: `pnpm test update-user-avatar-color.service.spec.ts`
Expected: PASS - All tests passing

**Step 6: Commit**

```bash
git add src/application/services/user/
git commit -m "feat: add update user avatar color service with tests"
```

---

## Task 5: Create User Application Module

**Files:**
- Create: `src/application/modules/user.module.ts`

**Step 1: Create user application module**

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
import { UpdateUserAvatarColorService } from '@/application/services/user/update-user-avatar-color.service';

@Module({
  imports: [DatabaseModule],
  providers: [UpdateUserAvatarColorService],
  exports: [UpdateUserAvatarColorService],
})
export class UserApplicationModule {}
```

**Step 2: Verify module was created**

Run: `cat src/application/modules/user.module.ts`
Expected: File contains UpdateUserAvatarColorService

**Step 3: Commit**

```bash
git add src/application/modules/user.module.ts
git commit -m "feat: add user application module"
```

---

## Task 6: Create User Controller

**Files:**
- Create: `src/api/user/user.controller.ts`

**Step 1: Create user controller with both endpoints**

```typescript
import { CurrentUser } from '@/api/auth/decorators/current-user.decorator';
import { UserMapper } from '@/application/mappers/user.mapper';
import type { JwtPayload } from '@/application/services/auth/auth.service';
import { UpdateUserAvatarColorService } from '@/application/services/user/update-user-avatar-color.service';
import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvatarColorsResponseDto } from './dto/avatar-colors-response.dto';
import { UpdateAvatarColorDto } from './dto/update-avatar-color.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly updateUserAvatarColorService: UpdateUserAvatarColorService,
  ) {}

  @Get('me/avatar-colors')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List available avatar colors',
    description: 'Returns the predefined palette of colors available for avatar customization',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available colors returned successfully',
    type: AvatarColorsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  async getAvatarColors(): Promise<AvatarColorsResponseDto> {
    return AvatarColorsResponseDto.create();
  }

  @Patch('me/avatar-color')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update avatar color',
    description: 'Updates the authenticated user\'s avatar color to one from the predefined palette',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar color updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid color (not in palette)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User not found',
  })
  async updateAvatarColor(
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateAvatarColorDto: UpdateAvatarColorDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserAvatarColorService.execute({
      userId: currentUser.sub,
      avatarColor: updateAvatarColorDto.avatarColor,
    });

    return UserMapper.toResponseDto(user);
  }
}
```

**Step 2: Verify controller was created**

Run: `cat src/api/user/user.controller.ts`
Expected: File contains both GET and PATCH endpoints

**Step 3: Commit**

```bash
git add src/api/user/user.controller.ts
git commit -m "feat: add user controller with avatar color endpoints"
```

---

## Task 7: Create User Response DTO

**Files:**
- Create: `src/api/user/dto/user-response.dto.ts`

**Step 1: Check if UserMapper already has toResponseDto method**

Run: `grep -n "toResponseDto" src/application/mappers/user.mapper.ts`

**Step 2: If toResponseDto doesn't exist, create UserResponseDto**

```typescript
import { UserRole, UserStatus } from '@/core/domain/shared/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'John',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Doe',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '+5511999999999',
  })
  phone!: string;

  @ApiProperty({
    description: 'Documento do usuário',
    example: '12345678900',
  })
  document!: string;

  @ApiProperty({
    description: 'Papel do usuário',
    enum: UserRole,
    example: UserRole.EXECUTOR,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Status do usuário',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @ApiProperty({
    description: 'URL da imagem de perfil',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profileImageUrl!: string | null;

  @ApiProperty({
    description: 'Cor do avatar',
    example: '#3B82F6',
    required: false,
  })
  avatarColor!: string | null;

  @ApiProperty({
    description: 'Iniciais do usuário',
    example: 'JD',
    required: false,
  })
  initials!: string | null;
}
```

**Step 3: Update UserMapper if needed**

Check if `src/application/mappers/user.mapper.ts` exists and has `toResponseDto`:

Run: `cat src/application/mappers/user.mapper.ts`

If it exists but doesn't have toResponseDto, add:

```typescript
static toResponseDto(user: User): UserResponseDto {
  const dto = new UserResponseDto();
  dto.id = user.id;
  dto.firstName = user.firstName;
  dto.lastName = user.lastName;
  dto.email = user.email;
  dto.phone = user.phone;
  dto.document = user.document;
  dto.role = user.role;
  dto.status = user.status;
  dto.profileImageUrl = user.profileImageUrl;
  dto.avatarColor = user.avatarColor;
  dto.initials = user.initials;
  return dto;
}
```

**Step 4: Commit**

```bash
git add src/api/user/dto/user-response.dto.ts src/application/mappers/user.mapper.ts
git commit -m "feat: add user response DTO and mapper method"
```

---

## Task 8: Create User API Module

**Files:**
- Create: `src/api/user/user.module.ts`

**Step 1: Create user API module**

```typescript
import { Module } from '@nestjs/common';
import { UserApplicationModule } from '@/application/modules/user.module';
import { UserController } from './user.controller';

@Module({
  imports: [UserApplicationModule],
  controllers: [UserController],
})
export class UserModule {}
```

**Step 2: Verify module was created**

Run: `cat src/api/user/user.module.ts`
Expected: File imports UserApplicationModule

**Step 3: Commit**

```bash
git add src/api/user/user.module.ts
git commit -m "feat: add user API module"
```

---

## Task 9: Register User Module in App Module

**Files:**
- Modify: `src/app.module.ts`

**Step 1: Check current app.module.ts structure**

Run: `grep -A 30 "imports:" src/app.module.ts`

**Step 2: Add UserModule to imports**

Add to imports array in `src/app.module.ts`:

```typescript
import { UserModule } from './api/user/user.module';

// In @Module imports array, add:
UserModule,
```

**Step 3: Verify app module was updated**

Run: `grep "UserModule" src/app.module.ts`
Expected: UserModule appears in imports

**Step 4: Run type check**

Run: `pnpm typecheck`
Expected: No type errors

**Step 5: Commit**

```bash
git add src/app.module.ts
git commit -m "feat: register user module in app module"
```

---

## Task 10: Run All Tests

**Files:**
- None (verification step)

**Step 1: Run all tests**

Run: `pnpm test`
Expected: All tests pass, including new UpdateUserAvatarColorService tests

**Step 2: Check test coverage for new service**

Run: `pnpm test:cov`
Expected: UpdateUserAvatarColorService has 100% coverage

**Step 3: If tests fail, fix issues and re-run**

Debug any failures:
- Check imports
- Verify all files exist
- Check for typos

**Step 4: Commit if any fixes were needed**

```bash
git add .
git commit -m "fix: resolve test failures"
```

---

## Task 11: Manual API Testing

**Files:**
- None (verification step)

**Step 1: Start the development server**

Run: `pnpm start:dev`
Expected: Server starts without errors

**Step 2: Test GET /users/me/avatar-colors endpoint**

Using curl or Postman:

```bash
# First login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then get avatar colors (replace TOKEN)
curl -X GET http://localhost:3000/users/me/avatar-colors \
  -H "Authorization: Bearer TOKEN"
```

Expected response:
```json
{
  "colors": [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316"
  ]
}
```

**Step 3: Test PATCH /users/me/avatar-color endpoint**

```bash
curl -X PATCH http://localhost:3000/users/me/avatar-color \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"avatarColor":"#10B981"}'
```

Expected: Returns user object with updated avatarColor

**Step 4: Test validation - invalid color**

```bash
curl -X PATCH http://localhost:3000/users/me/avatar-color \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"avatarColor":"#INVALID"}'
```

Expected: 400 Bad Request with validation error

**Step 5: Document successful tests**

Create a note or update docs with successful test results.

---

## Task 12: Update Error Messages Constants (if needed)

**Files:**
- Modify: `src/shared/constants/error-messages.ts`

**Step 1: Check if USER section has avatar-related messages**

Run: `grep -A 20 "USER:" src/shared/constants/error-messages.ts`

**Step 2: Add avatar color error messages if needed**

Add to USER section:

```typescript
AVATAR_COLOR_INVALID: 'A cor do avatar deve ser uma das cores predefinidas',
```

**Step 3: Commit if changes were made**

```bash
git add src/shared/constants/error-messages.ts
git commit -m "chore: add avatar color error messages"
```

---

## Task 13: Final Integration Test

**Files:**
- None (verification step)

**Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass

**Step 2: Run linter**

Run: `pnpm lint:check`
Expected: No linting errors

**Step 3: Run type checking**

Run: `pnpm typecheck`
Expected: No type errors

**Step 4: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 5: If any issues, fix and commit**

```bash
git add .
git commit -m "fix: resolve integration issues"
```

---

## Task 14: Update Design Document

**Files:**
- Modify: `docs/plans/2026-01-07-avatar-color-customization-design.md`

**Step 1: Mark implementation checklist items as complete**

Update the Implementation Checklist section with completed items:

```markdown
- [x] Create avatar-colors.ts constant
- [x] Create UpdateAvatarColorDto with validation
- [x] Create update-user-avatar-color.service.ts
- [x] Create/modify user.controller.ts with both endpoints
- [x] Update user.module.ts
- [x] Write unit tests
- [x] Backend implementation complete
```

**Step 2: Add implementation notes section**

Add at the end of the design doc:

```markdown
## Implementation Notes

**Completed:** 2026-01-07

**Files Created:**
- src/shared/constants/avatar-colors.ts
- src/api/user/dto/update-avatar-color.dto.ts
- src/api/user/dto/avatar-colors-response.dto.ts
- src/api/user/dto/user-response.dto.ts
- src/api/user/user.controller.ts
- src/api/user/user.module.ts
- src/application/services/user/update-user-avatar-color.service.ts
- src/application/services/user/update-user-avatar-color.service.spec.ts
- src/application/modules/user.module.ts

**Tests:** 100% coverage on UpdateUserAvatarColorService

**API Endpoints:**
- GET /users/me/avatar-colors
- PATCH /users/me/avatar-color
```

**Step 3: Commit**

```bash
git add docs/plans/2026-01-07-avatar-color-customization-design.md
git commit -m "docs: mark avatar color implementation as complete"
```

---

## Task 15: Final Commit and Summary

**Files:**
- None

**Step 1: Review all commits**

Run: `git log --oneline --graph`
Expected: See all feature commits

**Step 2: Ensure working directory is clean**

Run: `git status`
Expected: "nothing to commit, working tree clean"

**Step 3: Run final verification**

Run: `pnpm test && pnpm lint:check && pnpm typecheck && pnpm build`
Expected: All commands succeed

**Step 4: Document completion**

Implementation complete! Ready to merge or create PR.

---

## Notes for Implementation

**Testing Strategy:**
- Follow TDD: Write test → See it fail → Write code → See it pass → Commit
- Each service should have 100% test coverage
- Test happy path and error cases
- Test validation at DTO level

**Code Quality:**
- Follow existing patterns in the codebase
- Use dependency injection via @Inject decorator
- Follow NestJS conventions for modules, controllers, services
- Use class-validator decorators for DTOs
- Include Swagger/OpenAPI documentation via @ApiProperty

**Common Pitfalls to Avoid:**
- Don't skip the "run test to see it fail" step
- Don't write multiple features before committing
- Don't forget to add new modules to app.module.ts
- Don't skip validation testing
- Don't forget null/undefined checks

**DRY Principles:**
- Avatar colors defined once in constant
- Reuse UserMapper for response mapping
- Reuse CurrentUser decorator pattern
- Follow existing DTO validation patterns

**YAGNI Principles:**
- Only the two endpoints needed (GET colors, PATCH color)
- No admin override capability (not needed now)
- No color history tracking (not needed now)
- No custom color picker (predefined palette only)

**Execution Approach:**
- Each task should take 5-15 minutes
- Commit after each completed task
- Run tests frequently
- Keep implementation focused and minimal

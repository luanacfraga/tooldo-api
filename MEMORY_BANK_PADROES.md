# Memory Bank - Padrões de Implementação Weedu API

Este documento define os padrões que devem ser seguidos em TODAS as implementações do projeto Weedu API para manter consistência e qualidade do código.

## 🚫 REGRAS ABSOLUTAS

### 1. NÃO USAR ARQUIVOS index.ts
**NUNCA** criar arquivos `index.ts` para re-exportações.
- ❌ `application/modules/index.ts`
- ✅ Import direto: `import { AuthApplicationModule } from '@/application/modules/auth.module'`

### 2. NÃO USAR COMENTÁRIOS NO CÓDIGO
**NUNCA** adicionar comentários no código, incluindo:
- ❌ Comentários inline (`// comentário`)
- ❌ Comentários de bloco (`/* comentário */`)
- ❌ JSDoc (`/** comentário */`)
- ✅ O código deve ser auto-explicativo através de nomes claros

### 3. NÃO USAR console.log/console.error EM PRODUÇÃO
**NUNCA** deixar `console.log` ou `console.error` no código final.
- ❌ `console.log('debug')`
- ❌ `console.error('erro')`
- ✅ Usar `Logger` do NestJS quando necessário

## 📁 ESTRUTURA DE PASTAS

### Arquitetura Hexagonal (Clean Architecture)
```
src/
├── api/                    # Camada de Apresentação (Controllers)
│   ├── [feature]/
│   │   ├── [feature].controller.ts
│   │   ├── [feature].module.ts
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── guards/         # Route guards
│   │   ├── decorators/     # Custom decorators
│   │   └── strategies/     # Auth strategies
│   └── shared/
│       └── filters/        # Exception filters
│
├── application/            # Camada de Aplicação
│   ├── services/          # Use cases / Services
│   │   └── [feature]/
│   │       └── [action]-[feature].service.ts
│   ├── modules/           # Application modules
│   ├── mappers/           # Domain to DTO mappers
│   ├── factories/         # Entity factories
│   └── events/            # Event listeners
│
├── core/                   # Camada de Domínio
│   ├── domain/            # Entidades de domínio
│   │   └── [entity]/
│   │       ├── [entity].entity.ts
│   │       └── rules/     # Business rules
│   └── ports/             # Interfaces/Contratos
│       ├── repositories/  # Repository interfaces
│       └── services/      # Service interfaces
│
├── infra/                  # Camada de Infraestrutura
│   ├── database/          # Prisma e repositórios
│   │   ├── prisma/
│   │   └── repositories/  # Implementações dos repositórios
│   ├── services/          # Implementações de serviços
│   └── config/            # Configurações
│
└── shared/                 # Código compartilhado
    └── constants/         # Constantes e mensagens
```

## 📝 NOMENCLATURA

### Arquivos e Pastas
- **Controllers**: `[feature].controller.ts` (ex: `auth.controller.ts`)
- **Services**: `[action]-[feature].service.ts` (ex: `create-company.service.ts`)
- **Modules**: `[feature].module.ts` (ex: `company.module.ts`)
- **DTOs**: `[action]-[feature].dto.ts` ou `[feature]-response.dto.ts`
- **Entities**: `[entity].entity.ts` (ex: `company.entity.ts`)
- **Repositories**: `[entity].repository.ts` (ex: `company.repository.ts`)
- **Pastas**: kebab-case (`company-user/`, `auth-guards/`)

### Classes e Interfaces
- **Controllers**: `[Feature]Controller` (ex: `AuthController`)
- **Services**: `[Action][Feature]Service` (ex: `CreateCompanyService`)
- **Modules**: `[Feature]Module` (ex: `CompanyModule`)
- **DTOs**: `[Action][Feature]Dto` ou `[Feature]ResponseDto`
- **Entities**: `[Entity]` (ex: `Company`)
- **Repositories**: `[Entity]Repository` (ex: `CompanyRepository`)

### Variáveis e Funções
- **Variáveis**: camelCase (`companyId`, `userEmail`)
- **Constantes**: UPPER_SNAKE_CASE (`ERROR_MESSAGES`, `JWT_SECRET`)
- **Métodos**: camelCase (`createCompany`, `findById`)

## 🏗️ PADRÕES DE CÓDIGO

### 1. Controllers

```typescript
import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CreateCompanyService } from '@/application/services/company/create-company.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { CompanyResponseDto } from './dto/company-response.dto'

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(
    private readonly createCompanyService: CreateCompanyService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: CompanyResponseDto,
  })
  async create(@Body() dto: CreateCompanyDto): Promise<CompanyResponseDto> {
    const result = await this.createCompanyService.execute(dto)
    return CompanyResponseDto.fromDomain(result.company)
  }
}
```

**Regras**:
- Sempre usar decorators do Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- Sempre usar `@HttpCode` para definir status code
- DTOs de entrada devem validar com `class-validator`
- DTOs de saída devem ter método estático `fromDomain()`

### 2. Services (Use Cases)

```typescript
import { Injectable, Inject } from '@nestjs/common'
import type { CompanyRepository } from '@/core/ports/repositories/company.repository'
import { Company } from '@/core/domain/company/company.entity'
import { DomainValidationException } from '@/core/domain/shared/exceptions/domain.exception'
import { ErrorMessages } from '@/shared/constants/error-messages'

export interface CreateCompanyInput {
  name: string
  adminId: string
}

export interface CreateCompanyOutput {
  company: Company
}

@Injectable()
export class CreateCompanyService {
  constructor(
    @Inject('CompanyRepository')
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: CreateCompanyInput): Promise<CreateCompanyOutput> {
    const company = Company.create({
      name: input.name,
      adminId: input.adminId,
    })

    const created = await this.companyRepository.create(company)

    return { company: created }
  }
}
```

**Regras**:
- Sempre usar `@Injectable()` e injeção de dependência
- Sempre definir interfaces `Input` e `Output`
- Método principal sempre chamado `execute()`
- Sempre usar ports/interfaces, nunca implementações diretas
- Validações de domínio nas entidades, não nos services

### 3. Entities (Domain)

```typescript
import { DomainValidationException } from './shared/exceptions/domain.exception'
import { ErrorMessages } from '@/shared/constants/error-messages'

export class Company {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly adminId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id?: string
    name: string
    adminId: string
  }): Company {
    if (!params.name?.trim()) {
      throw new DomainValidationException(ErrorMessages.COMPANY.NAME_REQUIRED)
    }

    return new Company(
      params.id ?? crypto.randomUUID(),
      params.name.trim(),
      params.adminId,
      new Date(),
      new Date(),
    )
  }

  canBeDeleted(): boolean {
    return true
  }
}
```

**Regras**:
- Construtor sempre privado
- Método estático `create()` para criação
- Validações de negócio na entidade
- Métodos de regra de negócio como `canBeDeleted()`, `canAcceptInvite()`, etc.

### 4. DTOs

```typescript
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, MinLength } from 'class-validator'
import { Company } from '@/core/domain/company/company.entity'

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string
}

export class CompanyResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  adminId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  static fromDomain(company: Company): CompanyResponseDto {
    const dto = new CompanyResponseDto()
    dto.id = company.id
    dto.name = company.name
    dto.adminId = company.adminId
    dto.createdAt = company.createdAt
    dto.updatedAt = company.updatedAt
    return dto
  }
}
```

**Regras**:
- Sempre usar `class-validator` para validação
- Sempre usar `@ApiProperty()` para Swagger
- DTOs de resposta sempre têm método estático `fromDomain()`
- Nomes descritivos e claros

### 5. Repositories (Ports e Implementações)

**Port (Interface)**:
```typescript
export interface CompanyRepository {
  findById(id: string): Promise<Company | null>
  create(company: Company): Promise<Company>
  update(id: string, data: Partial<Company>): Promise<Company>
  delete(id: string): Promise<void>
}
```

**Implementação (Infrastructure)**:
```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Company } from '@/core/domain/company/company.entity'
import type { CompanyRepository } from '@/core/ports/repositories/company.repository'

@Injectable()
export class CompanyPrismaRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    const data = await this.prisma.company.findUnique({ where: { id } })
    return data ? this.mapToDomain(data) : null
  }

  private mapToDomain(data: PrismaCompany): Company {
    return Company.create({
      id: data.id,
      name: data.name,
      adminId: data.adminId,
    })
  }
}
```

**Regras**:
- Ports sempre em `core/ports/repositories/`
- Implementações sempre em `infra/database/repositories/`
- Sempre implementar interface do port
- Sempre mapear de Prisma para Domain e vice-versa

### 6. Modules

```typescript
import { Module } from '@nestjs/common'
import { CompanyController } from '@/api/company/company.controller'
import { CompanyApplicationModule } from '@/application/modules/company.module'

@Module({
  imports: [CompanyApplicationModule],
  controllers: [CompanyController],
})
export class CompanyModule {}
```

**Regras**:
- Modules da API apenas importam Application Modules
- Application Modules organizam Services e suas dependências
- Sempre usar injeção de dependência via tokens

## 📦 IMPORTS

### Ordem de Imports
1. NestJS core (`@nestjs/common`, `@nestjs/core`)
2. NestJS específicos (`@nestjs/swagger`, `@nestjs/jwt`)
3. Bibliotecas externas (por ordem alfabética)
4. Core/Domain (`@/core/domain`, `@/core/ports`)
5. Application (`@/application/services`, `@/application/modules`)
6. Infrastructure (`@/infra/database`, `@/infra/services`)
7. Shared (`@/shared/constants`)
8. Types (com `type` keyword)

### Exemplo
```typescript
import { Injectable, Inject } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { Company } from '@/core/domain/company/company.entity'
import type { CompanyRepository } from '@/core/ports/repositories/company.repository'
import { CreateCompanyService } from '@/application/services/company/create-company.service'
import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository'
import { ErrorMessages } from '@/shared/constants/error-messages'
```

## 🎨 TRATAMENTO DE ERROS

### Padrão
```typescript
import { DomainValidationException } from '@/core/domain/shared/exceptions/domain.exception'
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception'
import { ErrorMessages } from '@/shared/constants/error-messages'

if (!company) {
  throw new EntityNotFoundException('Empresa', companyId)
}

if (!company.canBeDeleted()) {
  throw new DomainValidationException(ErrorMessages.COMPANY.CANNOT_BE_DELETED)
}
```

**Regras**:
- Sempre usar exceções de domínio (`DomainException`, `EntityNotFoundException`, etc.)
- Sempre usar mensagens de `ErrorMessages`
- Nunca usar exceções HTTP diretamente no domínio
- Exception Filter global converte exceções de domínio para HTTP

## 🔐 AUTENTICAÇÃO E AUTORIZAÇÃO

### Guards
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Roles } from './decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get(Roles, context.getHandler())
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    return requiredRoles.some((role) => user?.role === role)
  }
}
```

**Regras**:
- Sempre usar `@Public()` para rotas públicas
- Sempre usar `@Roles()` para autorização por role
- Guards globais configurados em `app.module.ts`

## ✅ CHECKLIST ANTES DE COMMIT

- [ ] Nenhum arquivo `index.ts` criado ou usado
- [ ] Nenhum comentário no código
- [ ] Nenhum `console.log` ou `console.error` deixado
- [ ] Imports organizados na ordem correta
- [ ] Nomenclatura seguindo padrões
- [ ] Services tipados corretamente com Input/Output
- [ ] DTOs com validação e `fromDomain()`
- [ ] Entities com validações de negócio
- [ ] Repositories implementando ports
- [ ] Exceções usando classes de domínio
- [ ] Mensagens de erro usando `ErrorMessages`
- [ ] Código formatado (Prettier)
- [ ] Sem erros de lint (ESLint)

## 📚 REFERÊNCIAS

- Framework: NestJS 11
- Arquitetura: Hexagonal (Clean Architecture)
- Database: Prisma + PostgreSQL
- Validação: class-validator + class-transformer
- Documentação: Swagger/OpenAPI
- Testes: Jest


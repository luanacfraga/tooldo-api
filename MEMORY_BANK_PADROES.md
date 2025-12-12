# Memory Bank - Padrões de Implementação Tooldo API

> **Guia completo de padrões de código, arquitetura e boas práticas**

Este documento define os padrões que devem ser seguidos em **TODAS** as implementações do projeto Tooldo API para manter consistência e qualidade do código.

## 📋 Índice Rápido

- [Regras Absolutas](#-regras-absolutas)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Nomenclatura](#-nomenclatura)
- [Padrões de Código](#-padrões-de-código)
- [Imports](#-imports)
- [Tipagem e Type Safety](#-tipagem-e-type-safety)
- [ESLint e Qualidade](#-eslint-e-qualidade-de-código)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Checklist Antes de Commit](#-checklist-antes-de-commit)

## 🔗 Documentos Relacionados

- **[README.md](./README.md)**: Visão geral do projeto
- **[BUSINESS_RULES.md](./BUSINESS_RULES.md)**: Regras de negócio
- **[API_FLOWS.md](./docs/API_FLOWS.md)**: Fluxos da API
- **[ERROR_HANDLING.md](./docs/ERROR_HANDLING.md)**: Tratamento de erros

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

### 4. NÃO USAR TIPOS `any` OU TIPAGEM FRACA

**NUNCA** usar `any`, `unknown` sem validação, ou tipagem implícita.

- ❌ `function process(data: any) { ... }`
- ❌ `const result: any = await service.execute()`
- ❌ `as any` para contornar erros de tipo
- ✅ Sempre tipar explicitamente: `function process(data: CreateUserInput): Promise<User>`
- ✅ Usar `unknown` com type guards quando necessário: `if (isUser(data)) { ... }`
- ✅ Criar interfaces/tipos específicos para cada caso de uso
- ✅ Usar generics quando apropriado: `function findById<T>(id: string): Promise<T | null>`

### 5. NÃO DESABILITAR REGRAS DO ESLINT NO CÓDIGO

**NUNCA** usar `eslint-disable` ou `@ts-ignore` diretamente no código.

- ❌ `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
- ❌ `// @ts-ignore`
- ❌ `/* eslint-disable */`
- ✅ Se uma regra não faz sentido, desabilitar no arquivo de configuração (`eslint.config.mjs`)
- ✅ Se for realmente necessário, documentar o motivo e criar uma issue para revisar
- ✅ Preferir corrigir o código em vez de desabilitar a regra

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
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCompanyService } from '@/application/services/company/create-company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
  constructor(private readonly createCompanyService: CreateCompanyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: CompanyResponseDto,
  })
  async create(@Body() dto: CreateCompanyDto): Promise<CompanyResponseDto> {
    const result = await this.createCompanyService.execute(dto);
    return CompanyResponseDto.fromDomain(result.company);
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
import { Injectable, Inject } from '@nestjs/common';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { Company } from '@/core/domain/company/company.entity';
import { DomainValidationException } from '@/core/domain/shared/exceptions/domain.exception';
import { ErrorMessages } from '@/shared/constants/error-messages';

export interface CreateCompanyInput {
  name: string;
  adminId: string;
}

export interface CreateCompanyOutput {
  company: Company;
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
    });

    const created = await this.companyRepository.create(company);

    return { company: created };
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
import { DomainValidationException } from './shared/exceptions/domain.exception';
import { ErrorMessages } from '@/shared/constants/error-messages';

export class Company {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly adminId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id?: string;
    name: string;
    adminId: string;
  }): Company {
    if (!params.name?.trim()) {
      throw new DomainValidationException(ErrorMessages.COMPANY.NAME_REQUIRED);
    }

    return new Company(
      params.id ?? crypto.randomUUID(),
      params.name.trim(),
      params.adminId,
      new Date(),
      new Date(),
    );
  }

  canBeDeleted(): boolean {
    return true;
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
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { Company } from '@/core/domain/company/company.entity';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'Acme Corp' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}

export class CompanyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  adminId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(company: Company): CompanyResponseDto {
    const dto = new CompanyResponseDto();
    dto.id = company.id;
    dto.name = company.name;
    dto.adminId = company.adminId;
    dto.createdAt = company.createdAt;
    dto.updatedAt = company.updatedAt;
    return dto;
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
  findById(id: string): Promise<Company | null>;
  create(company: Company): Promise<Company>;
  update(id: string, data: Partial<Company>): Promise<Company>;
  delete(id: string): Promise<void>;
}
```

**Implementação (Infrastructure)**:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { Company } from '@/core/domain/company/company.entity';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';

@Injectable()
export class CompanyPrismaRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    const data = await this.prisma.company.findUnique({ where: { id } });
    return data ? this.mapToDomain(data) : null;
  }

  private mapToDomain(data: PrismaCompany): Company {
    return Company.create({
      id: data.id,
      name: data.name,
      adminId: data.adminId,
    });
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
import { Module } from '@nestjs/common';
import { CompanyController } from '@/api/company/company.controller';
import { CompanyApplicationModule } from '@/application/modules/company.module';

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

### Regras de Imports

- Sempre usar `type` para imports de tipos: `import type { UserRepository } from '...'`
- Nunca usar imports inline de tipos: `function process(data: import('./types').Input)`
- Agrupar imports do mesmo módulo: `import { Injectable, Inject } from '@nestjs/common'`
- Separar imports de tipos e valores quando necessário

## 🔷 TIPAGEM E TYPE SAFETY

### Regras de Tipagem

#### 1. Sempre Tipar Explicitamente

```typescript
// ❌ ERRADO
function process(data) {
  return data.map((item) => item.value);
}

// ✅ CORRETO
function process(data: ProcessInput[]): ProcessOutput[] {
  return data.map((item: ProcessInput) => item.value);
}
```

#### 2. Evitar `any` a Todo Custo

```typescript
// ❌ ERRADO
function handleEvent(event: any) {
  console.log(event.data);
}

// ✅ CORRETO - Criar interface específica
interface UserCreatedEvent {
  userId: string;
  email: string;
  createdAt: Date;
}

function handleEvent(event: UserCreatedEvent) {
  this.logger.log(`User created: ${event.userId}`);
}

// ✅ CORRETO - Usar unknown com type guard
function handleEvent(event: unknown) {
  if (isUserCreatedEvent(event)) {
    this.logger.log(`User created: ${event.userId}`);
  }
}
```

#### 3. Tipar Retornos de Funções

```typescript
// ❌ ERRADO
async function findUser(id: string) {
  return await this.repository.findById(id);
}

// ✅ CORRETO
async function findUser(id: string): Promise<User | null> {
  return await this.repository.findById(id);
}
```

#### 4. Usar Type Guards

```typescript
// ✅ CORRETO
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    typeof (data as User).id === 'string'
  );
}

function processUser(data: unknown) {
  if (isUser(data)) {
    // TypeScript sabe que data é User aqui
    return data.email;
  }
  throw new Error('Invalid user data');
}
```

#### 5. Tipar Parâmetros de Funções Assíncronas e Eventos

```typescript
// ❌ ERRADO
this.$on('query', (e) => {
  this.logger.debug(e.query);
});

// ✅ CORRETO - Criar interface para o evento
interface PrismaQueryEvent {
  query: string;
  params: string;
  duration: number;
}

this.$on('query' as never, (e: PrismaQueryEvent) => {
  this.logger.debug(e.query);
});
```

#### 6. Tipar Parâmetros de Bibliotecas Externas

```typescript
// ❌ ERRADO - Quando biblioteca externa não tem tipos
private getMaxLimitForRole(role: UserRole, plan: any): number {
  switch (role) {
    case UserRole.MANAGER:
      return plan.maxManagers
  }
}

// ✅ CORRETO - Criar interface baseada na entidade
interface PlanLimits {
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
}

private getMaxLimitForRole(role: UserRole, plan: PlanLimits): number {
  switch (role) {
    case UserRole.MANAGER:
      return plan.maxManagers
    case UserRole.EXECUTOR:
      return plan.maxExecutors
    case UserRole.CONSULTANT:
      return plan.maxConsultants
    default:
      return 0
  }
}
```

#### 7. Evitar Type Assertions Desnecessárias

```typescript
// ❌ ERRADO
const user = data as User;
const result = (await service.execute()) as CreateUserOutput;

// ✅ CORRETO - Validar e tipar corretamente
const user = User.create(data);
const result = await service.execute();
// result já está tipado como CreateUserOutput
```

#### 8. Tipar Objetos Literais

```typescript
// ❌ ERRADO
const config = {
  host: 'localhost',
  port: 3000,
};

// ✅ CORRETO
interface ServerConfig {
  host: string;
  port: number;
}

const config: ServerConfig = {
  host: 'localhost',
  port: 3000,
};
```

#### 9. Usar Generics Quando Apropriado

```typescript
// ❌ ERRADO
function findById(id: string) {
  return this.repository.findById(id);
}

// ✅ CORRETO
function findById<T extends Entity>(id: string): Promise<T | null> {
  return this.repository.findById(id);
}
```

#### 10. Tipar Funções de Callback

```typescript
// ❌ ERRADO
array.map((item) => item.value);
array.filter((item) => item.active);

// ✅ CORRETO
array.map((item: User) => item.email);
array.filter((item: User): item is User => item.active === true);
```

#### 11. Evitar `unknown` sem Validação

```typescript
// ❌ ERRADO
function process(data: unknown) {
  return data.value;
}

// ✅ CORRETO - Sempre validar unknown
function process(data: unknown) {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}

function isValidData(data: unknown): data is { value: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'value' in data &&
    typeof (data as { value: unknown }).value === 'string'
  );
}
```

## 🔧 ESLINT E QUALIDADE DE CÓDIGO

### Regras de Uso do ESLint

#### 1. Nunca Desabilitar Regras no Código

```typescript
// ❌ ERRADO - NUNCA fazer isso
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function process(data: any) { ... }

// @ts-ignore
const result = service.execute()
```

#### 2. Se uma Regra Não Faz Sentido, Desabilitar na Configuração

```javascript
// ✅ CORRETO - Em eslint.config.mjs
{
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // Se realmente necessário
    '@typescript-eslint/no-unsafe-assignment': 'off', // Para casos específicos
  }
}
```

#### 3. Preferir Corrigir o Código

```typescript
// ❌ ERRADO
// eslint-disable-next-line @typescript-eslint/no-floating-promises
service.execute();

// ✅ CORRETO
await service.execute();

// ✅ CORRETO - Se realmente não precisa aguardar
void service.execute();
```

#### 4. Documentar Exceções

Se for absolutamente necessário desabilitar uma regra:

1. Criar uma issue no repositório explicando o motivo
2. Adicionar comentário explicativo (mesmo que comentários sejam desencorajados, exceções para documentação técnica são aceitas)
3. Revisar periodicamente se ainda é necessário

#### 5. Regras Críticas que NUNCA Devem Ser Desabilitadas

- `@typescript-eslint/no-floating-promises` - Sempre aguardar ou usar `void`
- `@typescript-eslint/no-misused-promises` - Corrigir uso incorreto de promises
- `@typescript-eslint/await-thenable` - Não aguardar valores não-promise
- `prefer-const` - Sempre usar `const` quando possível
- `no-var` - Nunca usar `var`
- `eqeqeq` - Sempre usar `===` e `!==`

#### 6. Regras que Podem Ser Ajustadas na Configuração

- `@typescript-eslint/no-explicit-any` - Pode ser `warn` em vez de `error`
- `@typescript-eslint/no-unsafe-*` - Podem ser desabilitadas se necessário para integração com bibliotecas externas
- `no-console` - Pode permitir `console.warn` e `console.error`

### Verificação de Qualidade

- Sempre rodar `npm run lint:check` antes de commitar
- Corrigir todos os warnings e errors antes de fazer PR
- Usar `npm run typecheck` para verificar tipos
- Nunca commitar código com `any` sem justificativa documentada
- Revisar todos os `as` type assertions e garantir que são necessários
- Verificar se há alternativas antes de usar `unknown`

### Casos Especiais e Exceções

#### Quando `any` Pode Ser Aceito (Raramente)

Apenas em casos extremos onde:

1. A biblioteca externa não fornece tipos e não há `@types/package`
2. Integração com código legado que não pode ser refatorado imediatamente
3. Tipos dinâmicos de runtime que não podem ser inferidos em compile-time

**Sempre que usar `any`:**

1. Adicionar comentário explicando o motivo (única exceção à regra de comentários)
2. Criar issue para refatorar e remover o `any`
3. Documentar no PR o motivo e plano de remoção

```typescript
// Exceção: Prisma event types não são exportados
// TODO: Criar interface quando Prisma exportar tipos
// Issue: #123
this.$on('query' as never, (e: any) => {
  this.logger.debug(e.query);
});
```

#### Lidando com Bibliotecas sem Tipos

```typescript
// ❌ ERRADO
import { someLibrary } from 'library-without-types';
const result: any = someLibrary.process();

// ✅ CORRETO - Criar arquivo de declaração de tipos
// src/types/library-without-types.d.ts
declare module 'library-without-types' {
  export interface ProcessResult {
    success: boolean;
    data: string;
  }
  export function process(): ProcessResult;
}

// No código
import { someLibrary, type ProcessResult } from 'library-without-types';
const result: ProcessResult = someLibrary.process();
```

### Exemplo

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Company } from '@/core/domain/company/company.entity';
import type { CompanyRepository } from '@/core/ports/repositories/company.repository';
import { CreateCompanyService } from '@/application/services/company/create-company.service';
import { CompanyPrismaRepository } from '@/infra/database/repositories/company.prisma.repository';
import { ErrorMessages } from '@/shared/constants/error-messages';
```

## 🎨 TRATAMENTO DE ERROS

### Padrão

```typescript
import { DomainValidationException } from '@/core/domain/shared/exceptions/domain.exception';
import { EntityNotFoundException } from '@/core/domain/shared/exceptions/domain.exception';
import { ErrorMessages } from '@/shared/constants/error-messages';

if (!company) {
  throw new EntityNotFoundException('Empresa', companyId);
}

if (!company.canBeDeleted()) {
  throw new DomainValidationException(ErrorMessages.COMPANY.CANNOT_BE_DELETED);
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
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user?.role === role);
  }
}
```

**Regras**:

- Sempre usar `@Public()` para rotas públicas
- Sempre usar `@Roles()` para autorização por role
- Guards globais configurados em `app.module.ts`

## ✅ CHECKLIST ANTES DE COMMIT

### Regras Absolutas

- [ ] Nenhum arquivo `index.ts` criado ou usado
- [ ] Nenhum comentário no código
- [ ] Nenhum `console.log` ou `console.error` deixado
- [ ] Nenhum tipo `any` usado sem justificativa
- [ ] Nenhum `eslint-disable` ou `@ts-ignore` no código
- [ ] Nenhum `as any` ou type assertion desnecessário

### Estrutura e Nomenclatura

- [ ] Imports organizados na ordem correta
- [ ] Nomenclatura seguindo padrões
- [ ] Estrutura de pastas respeitando arquitetura hexagonal

### Tipagem

- [ ] Todas as funções têm tipos de retorno explícitos
- [ ] Todos os parâmetros estão tipados
- [ ] Interfaces Input/Output definidas para services
- [ ] Type guards usados quando necessário
- [ ] Sem tipos implícitos ou `any`

### Padrões de Código

- [ ] Services tipados corretamente com Input/Output
- [ ] DTOs com validação e `fromDomain()`
- [ ] Entities com validações de negócio e `create()` estático
- [ ] Repositories implementando ports
- [ ] Exceções usando classes de domínio
- [ ] Mensagens de erro usando `ErrorMessages`
- [ ] Controllers com `@HttpCode` e `@ApiOperation`

### Qualidade

- [ ] Código formatado (Prettier)
- [ ] Sem erros de lint (ESLint)
- [ ] Sem erros de tipo (TypeScript)
- [ ] `npm run validate` passa sem erros

## 📚 Referências

### Tecnologias

- **Framework**: NestJS 11
- **Arquitetura**: Hexagonal (Clean Architecture)
- **Database**: Prisma + PostgreSQL
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest

### Documentação Externa

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 🔗 Links Úteis

- [README.md](./README.md) - Visão geral do projeto
- [BUSINESS_RULES.md](./BUSINESS_RULES.md) - Regras de negócio
- [API_FLOWS.md](./docs/API_FLOWS.md) - Fluxos da API
- [ERROR_HANDLING.md](./docs/ERROR_HANDLING.md) - Tratamento de erros

---

**Documento criado em**: 2025-11-09  
**Última atualização**: 2025-12-11  
**Versão**: 1.0.0

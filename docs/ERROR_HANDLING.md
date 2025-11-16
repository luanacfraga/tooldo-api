# Sistema de Tratamento de Erros

Este documento descreve a arquitetura de tratamento de erros do projeto, que segue princípios de Clean Architecture e Domain-Driven Design.

## Estrutura

```
src/
├── shared/constants/
│   └── error-messages.ts          # Mensagens de erro centralizadas
├── core/domain/exceptions/
│   └── domain.exception.ts        # Exceções de domínio
├── api/exceptions/
│   └── http-exceptions.ts         # Exceções HTTP personalizadas
└── api/filters/
    └── domain-exception.filter.ts # Filtro global para capturar exceções de domínio
```

## 1. Mensagens Centralizadas

**Arquivo:** `src/shared/constants/error-messages.ts`

Todas as mensagens de erro estão centralizadas em um único arquivo para facilitar:
- Manutenção e atualização
- Tradução/internacionalização
- Reutilização
- Consistência

```typescript
export const ErrorMessages = {
  USER: {
    EMAIL_ALREADY_EXISTS: 'Email já cadastrado',
    PHONE_ALREADY_EXISTS: 'Telefone já cadastrado',
    // ...
  },
  PLAN: {
    NOT_FOUND: 'Plano não encontrado',
    // ...
  },
  // ...
} as const;
```

## 2. Exceções de Domínio

**Arquivo:** `src/core/domain/exceptions/domain.exception.ts`

Exceções que representam violações de regras de negócio no domínio:

### `DomainException` (Base)
Classe base para todas as exceções de domínio.

### `DomainValidationException`
Usada quando há violação de regras de validação de entidades.

```typescript
// Exemplo de uso em entidades
if (!this.email?.trim()) {
  throw new DomainValidationException(ErrorMessages.USER.EMAIL_REQUIRED);
}
```

### `EntityNotFoundException`
Usada quando uma entidade não é encontrada.

```typescript
// Exemplo de uso
throw new EntityNotFoundException('Plano', 'default');
// Mensagem: "Plano com identificador 'default' não foi encontrado(a)"
```

### `UniqueConstraintException`
Usada quando há violação de restrição de unicidade (duplicatas).

```typescript
// Exemplo de uso
throw new UniqueConstraintException('Email', user.email);
// Mensagem: "Email 'user@example.com' já está cadastrado"
```

## 3. Exceções HTTP Personalizadas

**Arquivo:** `src/api/exceptions/http-exceptions.ts`

Exceções HTTP customizadas que herdam do NestJS para uso direto em controllers:

- `ValidationException` - Extends `BadRequestException`
- `ResourceNotFoundException` - Extends `NotFoundException`
- `ResourceConflictException` - Extends `ConflictException`

## 4. Filtro Global de Exceções

**Arquivo:** `src/api/filters/domain-exception.filter.ts`

Intercepta exceções de domínio e as converte automaticamente para respostas HTTP apropriadas:

| Exceção de Domínio | Status HTTP | Código |
|-------------------|-------------|--------|
| `DomainValidationException` | Bad Request | 400 |
| `EntityNotFoundException` | Not Found | 404 |
| `UniqueConstraintException` | Conflict | 409 |
| Outras `DomainException` | Internal Server Error | 500 |

### Formato de Resposta

```json
{
  "statusCode": 400,
  "message": "O email do usuário é obrigatório",
  "error": "DomainValidationException",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 5. Fluxo de Tratamento de Erros

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Entidade/Serviço lança DomainException                   │
│    throw new DomainValidationException(...)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. DomainExceptionFilter intercepta                          │
│    @Catch(DomainException)                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Mapeia para status HTTP apropriado                       │
│    DomainValidationException → 400                          │
│    EntityNotFoundException → 404                            │
│    UniqueConstraintException → 409                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Retorna resposta JSON padronizada                        │
│    { statusCode, message, error, timestamp }                │
└─────────────────────────────────────────────────────────────┘
```

## 6. Exemplos de Uso

### Em Entidades (Domain Layer)

```typescript
import { DomainValidationException } from './exceptions/domain.exception';
import { ErrorMessages } from '@/shared/constants/error-messages';

export class User {
  private validate(): void {
    if (!this.email?.trim()) {
      throw new DomainValidationException(ErrorMessages.USER.EMAIL_REQUIRED);
    }
  }
}
```

### Em Serviços (Application Layer)

```typescript
import { UniqueConstraintException, EntityNotFoundException } from '@/core/domain/exceptions/domain.exception';

export class RegisterAdminService {
  async execute(input: RegisterAdminInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new UniqueConstraintException('Email', input.email);
    }

    const plan = await this.planRepository.findByName('default');
    if (!plan) {
      throw new EntityNotFoundException('Plano padrão');
    }

    // ...
  }
}
```

## 7. Vantagens da Abordagem

✅ **Centralização**: Todas as mensagens em um único lugar
✅ **Reutilização**: Exceções podem ser reutilizadas em todo o código
✅ **Consistência**: Formato padronizado de respostas
✅ **Manutenibilidade**: Fácil de atualizar mensagens e comportamentos
✅ **Separação de Responsabilidades**: Domínio não conhece detalhes HTTP
✅ **Testabilidade**: Exceções de domínio podem ser testadas isoladamente
✅ **Type Safety**: TypeScript garante que mensagens existem (as const)

## 8. Boas Práticas

1. **Use exceções de domínio em entidades e serviços de aplicação**
2. **Use exceções HTTP apenas em controllers quando necessário**
3. **Sempre use ErrorMessages para as mensagens**
4. **Não capture exceções de domínio manualmente - deixe o filtro fazer isso**
5. **Adicione novas mensagens ao ErrorMessages quando necessário**
6. **Crie novas exceções de domínio se necessário para novos casos de uso**

## 9. Adicionando Novas Mensagens

```typescript
// src/shared/constants/error-messages.ts
export const ErrorMessages = {
  // ...
  NEW_ENTITY: {
    ID_REQUIRED: 'O id da nova entidade é obrigatório',
    NAME_REQUIRED: 'O nome da nova entidade é obrigatório',
    // ...
  },
} as const;
```

## 10. Adicionando Novas Exceções

```typescript
// src/core/domain/exceptions/domain.exception.ts
export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

// Adicionar no filtro para mapear o status HTTP
// src/api/filters/domain-exception.filter.ts
if (exception instanceof BusinessRuleViolationException) {
  status = HttpStatus.UNPROCESSABLE_ENTITY; // 422
}
```

# 🗄️ Estado Atual do Banco de Dados - Weedu API

## 📊 Resumo Visual

### Modelos e Relacionamentos

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
│  id, firstName, lastName, email, phone, document, role      │
│  status, password, profileImageUrl, createdAt, updatedAt    │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │SUBSCRIPTION│       │ COMPANY  │       │TEAM     │
    │           │       │         │       │          │
    │ adminId   │       │ adminId │       │managerId │
    │ planId    │       │ name    │       │companyId │
    │ isActive  │       │ desc    │       │name      │
    └────┬────┘         └────┬────┘       └────┬────┘
         │                    │                    │
         │                    │                    │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │  PLAN   │         │COMPANYUSER│       │TEAMUSER │
    │         │         │           │       │         │
    │ name    │         │ companyId │       │ teamId   │
    │ limits  │         │ userId    │       │ userId   │
    │         │         │ role      │       │          │
    └─────────┘         └───────────┘       └─────────┘
                                │
                                │
                         ┌──────▼──────┐
                         │  IAUSAGE    │
                         │             │
                         │subscriptionId
                         │tokensUsed   │
                         └─────────────┘
```

---

## 📋 Tabelas e Campos

### 1. `users` (Usuários)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `first_name` | String | NOT NULL | Primeiro nome |
| `last_name` | String | NOT NULL | Sobrenome |
| `email` | String | UNIQUE, NOT NULL | Email único |
| `phone` | String | UNIQUE, NOT NULL | Telefone único |
| `document` | String | UNIQUE, NOT NULL | CPF/CNPJ único |
| `document_type` | Enum | NOT NULL | CPF ou CNPJ |
| `profile_image_url` | String | NULL | URL da imagem |
| `status` | Enum | DEFAULT PENDING | ACTIVE, DELETED, PENDING |
| `password` | String | NOT NULL | Senha hasheada |
| `role` | Enum | NOT NULL | master, admin, manager, executor, consultant |
| `created_at` | DateTime | DEFAULT NOW | Data de criação |
| `updated_at` | DateTime | AUTO UPDATE | Data de atualização |

**Índices:**
- `users_email_key` (UNIQUE)
- `users_phone_key` (UNIQUE)
- `users_document_key` (UNIQUE)

---

### 2. `plans` (Planos)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `name` | String | NOT NULL | Nome do plano |
| `max_companies` | Integer | NOT NULL | Limite de empresas |
| `max_managers` | Integer | NOT NULL | Limite de gestores |
| `max_executors` | Integer | NOT NULL | Limite de executores |
| `max_consultants` | Integer | NOT NULL | Limite de consultores |
| `ia_calls_limit` | Integer | NOT NULL | Limite de chamadas IA |
| `created_at` | DateTime | DEFAULT NOW | Data de criação |
| `updated_at` | DateTime | AUTO UPDATE | Data de atualização |

---

### 3. `subscriptions` (Assinaturas)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `admin_id` | UUID | FK → users.id | Admin dono da assinatura |
| `plan_id` | UUID | FK → plans.id | Plano contratado |
| `started_at` | DateTime | DEFAULT NOW | Data de início |
| `is_active` | Boolean | DEFAULT true | Se está ativa |
| `created_at` | DateTime | DEFAULT NOW | Data de criação |
| `updated_at` | DateTime | AUTO UPDATE | Data de atualização |

**Foreign Keys:**
- `subscriptions_admin_id_fkey` → `users(id)`
- `subscriptions_plan_id_fkey` → `plans(id)`

---

### 4. `companies` (Empresas)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `name` | String | NOT NULL | Nome da empresa |
| `description` | String | NULL | Descrição opcional |
| `admin_id` | UUID | FK → users.id | Admin dono |
| `created_at` | DateTime | DEFAULT NOW | Data de criação |
| `updated_at` | DateTime | AUTO UPDATE | Data de atualização |

**Foreign Keys:**
- `companies_admin_id_fkey` → `users(id)` (CASCADE)

---

### 5. `company_users` (Membros de Empresa)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `company_id` | UUID | FK → companies.id | Empresa |
| `user_id` | UUID | FK → users.id | Usuário |
| `role` | Enum | NOT NULL | manager, executor, consultant |
| `created_at` | DateTime | DEFAULT NOW | Data de criação |
| `updated_at` | DateTime | AUTO UPDATE | Data de atualização |

**Foreign Keys:**
- `company_users_company_id_fkey` → `companies(id)` (CASCADE)
- `company_users_user_id_fkey` → `users(id)` (CASCADE)

**Unique Constraints:**
- `company_users_company_id_user_id_key` (company_id, user_id)

---

### 6. `teams` (Equipes)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `name` | String | NOT NULL | Nome da equipe |
| `description` | String | NULL | Descrição opcional |
| `ia_context` | String | NULL | Contexto para IA |
| `company_id` | UUID | FK → companies.id | Empresa |
| `manager_id` | UUID | FK → users.id | Gestor |
| `created_at` | DateTime | DEFAULT NOW | Data de criação |
| `updated_at` | DateTime | AUTO UPDATE | Data de atualização |

**Foreign Keys:**
- `teams_company_id_fkey` → `companies(id)` (CASCADE)
- `teams_manager_id_fkey` → `users(id)`

---

### 7. `team_users` (Membros de Equipe)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `team_id` | UUID | FK → teams.id | Equipe |
| `user_id` | UUID | FK → users.id | Executor |
| `created_at` | DateTime | DEFAULT NOW | Data de criação |
| `updated_at` | DateTime | AUTO UPDATE | Data de atualização |

**Foreign Keys:**
- `team_users_team_id_fkey` → `teams(id)` (CASCADE)
- `team_users_user_id_fkey` → `users(id)` (CASCADE)

**Unique Constraints:**
- `team_users_team_id_user_id_key` (team_id, user_id)

---

### 8. `ia_usages` (Uso de IA)

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PK | Identificador único |
| `subscription_id` | UUID | FK → subscriptions.id | Assinatura |
| `user_id` | UUID | NULL | Usuário que usou (opcional) |
| `company_id` | UUID | NULL | Empresa relacionada (opcional) |
| `tokens_used` | Integer | NOT NULL | Tokens consumidos |
| `created_at` | DateTime | DEFAULT NOW | Data de uso |

**Foreign Keys:**
- `ia_usages_subscription_id_fkey` → `subscriptions(id)`

---

## 🔗 Relacionamentos Detalhados

### User → Subscription
- **Tipo:** 1:N (um admin pode ter várias subscriptions)
- **Constraint:** Apenas uma ativa por vez (`isActive = true`)
- **Cascade:** Nenhum (RESTRICT)

### User → Company
- **Tipo:** 1:N (um admin pode ter várias empresas)
- **Cascade:** Nenhum (RESTRICT)

### Company → CompanyUser
- **Tipo:** 1:N (uma empresa pode ter vários membros)
- **Cascade:** DELETE (ao deletar empresa, remove membros)

### Company → Team
- **Tipo:** 1:N (uma empresa pode ter várias equipes)
- **Cascade:** DELETE (ao deletar empresa, remove equipes)

### Team → TeamUser
- **Tipo:** 1:N (uma equipe pode ter vários executores)
- **Cascade:** DELETE (ao deletar equipe, remove membros)

### User → CompanyUser
- **Tipo:** 1:N (um usuário pode estar em várias empresas)
- **Cascade:** DELETE (ao deletar usuário, remove relacionamentos)

### User → TeamUser
- **Tipo:** 1:N (um usuário pode estar em várias equipes)
- **Cascade:** DELETE (ao deletar usuário, remove relacionamentos)

### Subscription → IAUsage
- **Tipo:** 1:N (uma subscription pode ter vários usos)
- **Cascade:** Nenhum (RESTRICT)

---

## 📈 Estatísticas e Limites

### Limites por Plano

| Limite | Campo | Escopo | Validação |
|--------|-------|--------|-----------|
| Empresas | `max_companies` | Por admin | Ao criar empresa |
| Gestores | `max_managers` | Global (todas empresas) | Ao adicionar CompanyUser |
| Executores | `max_executors` | Global (todas empresas) | Ao adicionar CompanyUser |
| Consultores | `max_consultants` | Global (todas empresas) | Ao adicionar CompanyUser |
| Chamadas IA | `ia_calls_limit` | Por subscription | Ao usar IA |

### Contagem de Limites

**Importante:** Os limites de membros são contados **globalmente** entre todas as empresas do admin.

**Exemplo:**
```
Admin com plano: maxManagers = 10

Empresa A: 3 managers
Empresa B: 4 managers
Empresa C: 3 managers
Total: 10 managers ✓

Tentar adicionar manager na Empresa A → ERRO (10 >= 10)
```

---

## 🔐 Constraints e Validações

### Unique Constraints

1. `users.email` - Email único
2. `users.phone` - Telefone único
3. `users.document` - Documento único
4. `company_users(company_id, user_id)` - Um usuário não pode ter múltiplos papéis na mesma empresa
5. `team_users(team_id, user_id)` - Um usuário não pode estar duplicado na mesma equipe

### Foreign Key Constraints

Todas as foreign keys estão configuradas com:
- **ON DELETE CASCADE:** Para relacionamentos dependentes (CompanyUser, TeamUser, etc.)
- **ON DELETE RESTRICT:** Para relacionamentos principais (Subscription, Company, etc.)

### Validações de Negócio

1. **Subscription ativa:** Apenas uma subscription com `isActive = true` por admin
2. **Limite de empresas:** Validado ao criar empresa
3. **Limite de membros:** Validado ao adicionar CompanyUser (global)
4. **Hierarquia de equipes:** Gestor deve ser CompanyUser com role = manager
5. **Hierarquia de membros:** Executor deve ser CompanyUser com role = executor

---

## 📝 Enums

### UserRole
```typescript
enum UserRole {
  master      // Usuário master (cria planos)
  admin       // Administrador (cria empresas)
  manager     // Gestor (lidera equipes)
  executor    // Executor (membro de equipes)
  consultant  // Consultor (não participa de equipes)
}
```

### UserStatus
```typescript
enum UserStatus {
  ACTIVE   // Usuário ativo
  DELETED  // Usuário deletado
  PENDING  // Usuário pendente (padrão)
}
```

### DocumentType
```typescript
enum DocumentType {
  CPF   // CPF
  CNPJ  // CNPJ
}
```

---

## 🚀 Migrações Aplicadas

O banco de dados foi criado com as seguintes tabelas:
- `users`
- `plans`
- `subscriptions`
- `companies`
- `company_users`
- `teams`
- `team_users`
- `ia_usages`

Todas as constraints, índices e relacionamentos foram configurados conforme o schema Prisma.

---

**Documento criado em:** 2025-11-14  
**Versão do Schema:** 1.0.0  
**Database:** PostgreSQL


# 📚 Documentação de Fluxos e Estado do Banco de Dados

## 📋 Índice

1. [Estado Atual do Banco de Dados](#estado-atual-do-banco-de-dados)
2. [Fluxos Implementados](#fluxos-implementados)
3. [Endpoints Disponíveis](#endpoints-disponíveis)
4. [Estrutura de Dados](#estrutura-de-dados)

---

## 🗄️ Estado Atual do Banco de Dados

### Schema Prisma - Modelos Disponíveis

#### 1. **User** (Usuário)

```prisma
model User {
  id              String       @id @default(uuid())
  firstName       String       @map("first_name")
  lastName        String       @map("last_name")
  email           String       @unique
  phone           String       @unique
  document        String       @unique
  documentType    DocumentType
  profileImageUrl String?
  status          UserStatus   @default(PENDING)
  password        String
  role            UserRole
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  subscriptions Subscription[]
  companies     Company[]      @relation("CompanyAdmin")
  companyMemberships CompanyUser[]
  teamsManaged    Team[]     @relation("TeamManager")
  teamMemberships TeamUser[]
}
```

**Enums Relacionados:**

- `UserRole`: `master`, `admin`, `manager`, `executor`, `consultant`
- `UserStatus`: `ACTIVE`, `DELETED`, `PENDING`
- `DocumentType`: `CPF`, `CNPJ`

**Constraints:**

- `email`: Único
- `phone`: Único
- `document`: Único

---

#### 2. **Plan** (Plano)

```prisma
model Plan {
  id             String   @id @default(uuid())
  name           String
  maxCompanies   Int      @map("max_companies")
  maxManagers    Int      @map("max_managers")
  maxExecutors   Int      @map("max_executors")
  maxConsultants Int      @map("max_consultants")
  iaCallsLimit   Int      @map("ia_calls_limit")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  subscriptions Subscription[]
}
```

**Campos de Limite:**

- `maxCompanies`: Máximo de empresas que o admin pode criar
- `maxManagers`: Máximo total de gestores (soma de todas as empresas)
- `maxExecutors`: Máximo total de executores (soma de todas as empresas)
- `maxConsultants`: Máximo total de consultores (soma de todas as empresas)
- `iaCallsLimit`: Limite de tokens/chamadas IA por período

---

#### 3. **Subscription** (Assinatura)

```prisma
model Subscription {
  id        String   @id @default(uuid())
  adminId   String   @map("admin_id")
  planId    String   @map("plan_id")
  startedAt DateTime @default(now())
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  admin    User      @relation(fields: [adminId], references: [id])
  plan     Plan      @relation(fields: [planId], references: [id])
  iaUsages IAUsage[]
}
```

**Regras:**

- Um admin pode ter apenas uma subscription ativa por vez (`isActive = true`)
- A subscription determina os limites para todas as empresas do admin

---

#### 4. **Company** (Empresa)

```prisma
model Company {
  id          String   @id @default(uuid())
  name        String
  description String?
  adminId     String   @map("admin_id")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  admin   User          @relation("CompanyAdmin", fields: [adminId], references: [id])
  members CompanyUser[]
  teams   Team[]
}
```

**Regras:**

- Uma empresa pertence a apenas um admin
- Ao deletar uma empresa, remove todos os membros e equipes (cascade)

---

#### 5. **CompanyUser** (Membro da Empresa)

```prisma
model CompanyUser {
  id        String   @id @default(uuid())
  companyId String   @map("company_id")
  userId    String   @map("user_id")
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([companyId, userId])
}
```

**Constraints:**

- `@@unique([companyId, userId])`: Um usuário não pode ter múltiplos papéis na mesma empresa

**Roles Válidos:**

- `manager`: Pode ser gestor de equipes
- `executor`: Pode ser membro de equipes
- `consultant`: Não participa de equipes

---

#### 6. **Team** (Equipe)

```prisma
model Team {
  id          String   @id @default(uuid())
  name        String
  description String?
  iaContext   String?  @map("ia_context")
  companyId   String   @map("company_id")
  managerId   String   @map("manager_id")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company    @relation(fields: [companyId], references: [id], onDelete: Cascade)
  manager User       @relation("TeamManager", fields: [managerId], references: [id])
  members TeamUser[]
}
```

**Regras:**

- Uma equipe pertence a apenas uma empresa
- Uma equipe tem exatamente um gestor
- O gestor deve estar cadastrado na empresa como `CompanyUser` com `role = manager`
- `iaContext`: Campo opcional para contexto descritivo usado pela IA

---

#### 7. **TeamUser** (Membro da Equipe)

```prisma
model TeamUser {
  id        String   @id @default(uuid())
  teamId    String   @map("team_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
}
```

**Constraints:**

- `@@unique([teamId, userId])`: Um usuário não pode estar duplicado na mesma equipe

**Regras:**

- Apenas executores podem ser membros de equipes
- O executor deve estar cadastrado na empresa como `CompanyUser` com `role = executor`

---

#### 8. **IAUsage** (Uso de IA)

```prisma
model IAUsage {
  id             String   @id @default(uuid())
  subscriptionId String   @map("subscription_id")
  userId         String?  @map("user_id")
  companyId      String?  @map("company_id")
  tokensUsed     Int      @map("tokens_used")
  createdAt      DateTime @default(now())

  subscription Subscription @relation(fields: [subscriptionId], references: [id])
}
```

**Regras:**

- Cada uso de IA é registrado individualmente
- O total de tokens é somado por subscription
- O limite é verificado contra `plan.iaCallsLimit`

---

### Diagrama de Relacionamentos

```
User (admin)
  │
  ├── Subscription (1:N)
  │     ├── Plan (N:1)
  │     └── IAUsage (1:N)
  │
  └── Company (1:N)
        │
        ├── CompanyUser (1:N)
        │     ├── User (manager/executor/consultant)
        │     └── role: manager | executor | consultant
        │
        └── Team (1:N)
              │
              ├── User (manager) [via managerId]
              │     └── Deve ser CompanyUser com role = manager
              │
              └── TeamUser (1:N)
                    └── User (executor) [via userId]
                          └── Deve ser CompanyUser com role = executor
```

---

## 🔄 Fluxos Implementados

### 1. **Autenticação e Registro**

#### 1.1. Login

**Endpoint:** `POST /api/v1/auth/login`

**Descrição:** Autentica um usuário e retorna um token JWT.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "role": "admin"
  }
}
```

**Validações:**

- Email e senha são obrigatórios
- Verifica se o usuário existe
- Valida a senha usando hash

---

#### 1.2. Registro de Administrador

**Endpoint:** `POST /api/v1/auth/register`

**Descrição:** Cria um novo administrador com empresa e assinatura inicial.

**Request Body:**

```json
{
  "firstName": "João",
  "lastName": "Silva",
  "email": "admin@example.com",
  "password": "senha123",
  "phone": "11987654321",
  "document": "12345678900",
  "documentType": "CPF",
  "company": {
    "name": "Tooldo Tecnologia",
    "description": "Empresa de tecnologia focada em educação"
  }
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "firstName": "João",
    "lastName": "Silva",
    "email": "admin@example.com",
    "phone": "11987654321",
    "document": "12345678900",
    "documentType": "CPF",
    "role": "admin",
    "status": "PENDING"
  },
  "company": {
    "id": "uuid",
    "name": "Tooldo Tecnologia",
    "description": "Empresa de tecnologia focada em educação",
    "adminId": "uuid"
  },
  "subscription": {
    "id": "uuid",
    "adminId": "uuid",
    "planId": "uuid",
    "startedAt": "2025-11-14T20:00:00.000Z",
    "isActive": true
  }
}
```

**Validações:**

- Email, telefone e documento devem ser únicos
- Busca o plano padrão (nome: "default")
- Cria usuário, empresa e subscription em uma transação

**Erros Possíveis:**

- `400`: Email, telefone ou documento já cadastrado
- `404`: Plano padrão não encontrado

---

#### 1.3. Registro de Master

**Endpoint:** `POST /api/v1/auth/register-master`

**Descrição:** Cria um usuário master responsável por criar e editar planos.

**Request Body:**

```json
{
  "firstName": "Master",
  "lastName": "User",
  "email": "master@example.com",
  "password": "senha123",
  "phone": "11987654322",
  "document": "98765432100",
  "documentType": "CPF"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "firstName": "Master",
    "lastName": "User",
    "email": "master@example.com",
    "phone": "11987654322",
    "document": "98765432100",
    "documentType": "CPF",
    "role": "master",
    "status": "PENDING"
  }
}
```

**Validações:**

- Email, telefone e documento devem ser únicos

---

### 2. **Gestão de Planos**

#### 2.1. Criar Plano

**Endpoint:** `POST /api/v1/plan`

**Descrição:** Cria um novo plano com limites definidos.

**Request Body:**

```json
{
  "name": "Plano Premium",
  "maxCompanies": 10,
  "maxManagers": 50,
  "maxExecutors": 100,
  "maxConsultants": 30,
  "iaCallsLimit": 1000
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Plano Premium",
  "maxCompanies": 10,
  "maxManagers": 50,
  "maxExecutors": 100,
  "maxConsultants": 30,
  "iaCallsLimit": 1000
}
```

**Validações:**

- Todos os campos são obrigatórios
- Todos os valores devem ser números inteiros positivos

---

#### 2.2. Listar Planos

**Endpoint:** `GET /api/v1/plan`

**Descrição:** Retorna a lista de todos os planos cadastrados.

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Plano Básico",
    "maxCompanies": 5,
    "maxManagers": 10,
    "maxExecutors": 20,
    "maxConsultants": 15,
    "iaCallsLimit": 500
  },
  {
    "id": "uuid",
    "name": "Plano Premium",
    "maxCompanies": 10,
    "maxManagers": 50,
    "maxExecutors": 100,
    "maxConsultants": 30,
    "iaCallsLimit": 1000
  }
]
```

---

#### 2.3. Atualizar Plano

**Endpoint:** `PUT /api/v1/plan/:id`

**Descrição:** Atualiza um plano existente.

**Request Body:**

```json
{
  "name": "Plano Premium Atualizado",
  "maxCompanies": 15,
  "maxManagers": 60,
  "maxExecutors": 120,
  "maxConsultants": 35,
  "iaCallsLimit": 1500
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Plano Premium Atualizado",
  "maxCompanies": 15,
  "maxManagers": 60,
  "maxExecutors": 120,
  "maxConsultants": 35,
  "iaCallsLimit": 1500
}
```

**Validações:**

- Plano deve existir
- Todos os valores devem ser números inteiros positivos

**Erros Possíveis:**

- `404`: Plano não encontrado

---

### 3. **Gestão de Empresas**

#### 3.1. Criar Empresa

**Endpoint:** `POST /api/v1/companies`

**Descrição:** Cria uma nova empresa para um administrador.

**Request Body:**

```json
{
  "adminId": "uuid-do-admin",
  "name": "Nova Empresa",
  "description": "Descrição da empresa (opcional)"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "Nova Empresa",
  "description": "Descrição da empresa (opcional)",
  "adminId": "uuid-do-admin"
}
```

**Validações:**

- Admin deve existir
- Admin deve ter uma subscription ativa
- Não deve exceder o limite `maxCompanies` do plano

**Processo de Validação:**

1. Verifica se o admin existe
2. Busca a subscription ativa do admin
3. Busca o plano da subscription
4. Conta quantas empresas o admin já possui
5. Compara com `plan.maxCompanies`
6. Se `count >= maxCompanies` → **ERRO**
7. Se `count < maxCompanies` → **CRIA EMPRESA**

**Erros Possíveis:**

- `404`: Administrador não encontrado
- `404`: Assinatura ativa não encontrada
- `400`: Limite máximo de empresas do plano foi excedido

---

## 📊 Estrutura de Dados

### Tabelas do Banco de Dados

| Tabela          | Descrição                   | Relacionamentos Principais |
| --------------- | --------------------------- | -------------------------- |
| `users`         | Usuários do sistema         | -                          |
| `plans`         | Planos disponíveis          | -                          |
| `subscriptions` | Assinaturas de admins       | `users`, `plans`           |
| `companies`     | Empresas criadas por admins | `users`                    |
| `company_users` | Membros das empresas        | `companies`, `users`       |
| `teams`         | Equipes dentro das empresas | `companies`, `users`       |
| `team_users`    | Membros das equipes         | `teams`, `users`           |
| `ia_usages`     | Registro de uso de IA       | `subscriptions`            |

### Constraints e Índices

**Unique Constraints:**

- `users.email`: Único
- `users.phone`: Único
- `users.document`: Único
- `company_users(company_id, user_id)`: Único
- `team_users(team_id, user_id)`: Único

**Foreign Keys:**

- `subscriptions.admin_id` → `users.id`
- `subscriptions.plan_id` → `plans.id`
- `companies.admin_id` → `users.id`
- `company_users.company_id` → `companies.id` (CASCADE)
- `company_users.user_id` → `users.id` (CASCADE)
- `teams.company_id` → `companies.id` (CASCADE)
- `teams.manager_id` → `users.id`
- `team_users.team_id` → `teams.id` (CASCADE)
- `team_users.user_id` → `users.id` (CASCADE)
- `ia_usages.subscription_id` → `subscriptions.id`

### Cascade Deletes

1. **Company → CompanyUser**: Ao deletar empresa, remove todos os membros
2. **Company → Team**: Ao deletar empresa, remove todas as equipes
3. **Team → TeamUser**: Ao deletar equipe, remove todos os membros
4. **User → CompanyUser**: Ao deletar usuário, remove todos os relacionamentos com empresas
5. **User → TeamUser**: Ao deletar usuário, remove todos os relacionamentos com equipes

---

## 🔐 Autenticação e Autorização

### JWT Authentication

- **Tipo:** Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Validação:** Automática via `JwtAuthGuard` (aplicado globalmente)
- **Rotas Públicas:** Decoradas com `@Public()`

### Rotas Públicas Atuais

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/register-master`

### Rotas Protegidas

Todas as outras rotas requerem autenticação JWT válida.

---

## 📝 Notas Importantes

1. **Plano vinculado ao admin**: Todas as empresas do admin compartilham os limites do plano
2. **Limites globais**: Contagem de membros é feita entre todas as empresas, não por empresa
3. **Subscription ativa**: Sempre buscar a subscription com `isActive = true`
4. **Plano padrão**: O registro de admin busca automaticamente um plano com nome "default"
5. **Validações em cascata**: Validações devem ser feitas na ordem correta (empresa → membro → equipe)

---

## 🚀 Próximos Passos (Não Implementados)

### Fluxos Pendentes

1. **Gestão de Membros de Empresa**
   - Adicionar membro à empresa (CompanyUser)
   - Remover membro da empresa
   - Listar membros de uma empresa
   - Validar limites globais (maxManagers, maxExecutors, maxConsultants)

2. **Gestão de Equipes**
   - Criar equipe
   - Atualizar equipe (incluindo iaContext)
   - Adicionar executor à equipe
   - Remover executor da equipe
   - Listar equipes de uma empresa
   - Listar membros de uma equipe

3. **Gestão de Uso de IA**
   - Registrar uso de IA
   - Validar limite de tokens
   - Consultar histórico de uso
   - Consultar limite disponível

4. **Gestão de Usuários**
   - Atualizar perfil de usuário
   - Listar usuários
   - Ativar/desativar usuário

5. **Gestão de Empresas**
   - Listar empresas de um admin
   - Atualizar empresa
   - Deletar empresa

---

**Documento criado em:** 2025-11-14  
**Versão da API:** 1.0  
**Base URL:** `/api/v1`

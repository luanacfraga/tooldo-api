# 📋 Regras de Negócio - Tooldo API

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Entidades](#estrutura-de-entidades)
3. [Hierarquia e Relacionamentos](#hierarquia-e-relacionamentos)
4. [Regras de Validação](#regras-de-validação)
5. [Limites e Controles](#limites-e-controles)
6. [Fluxos de Operação](#fluxos-de-operação)

---

## 🎯 Visão Geral

O sistema Tooldo é uma plataforma de gestão que permite:

- **Admins** contratarem **Planos** com limites específicos
- **Admins** criarem **Empresas** (limitado pelo plano)
- **Empresas** terem **Membros** (gestores, executores, consultores)
- **Empresas** organizarem membros em **Equipes**
- **Equipes** terem um **Gestor** e vários **Executores**
- Controle de uso de **Chamadas IA** por subscription

### Princípio Fundamental

> **O plano é vinculado ao ADMIN, não à empresa.**
>
> Todas as empresas de um admin compartilham os limites definidos pelo plano contratado.

---

## 🏗️ Estrutura de Entidades

### 1. **User** (Usuário)

**Descrição**: Representa qualquer pessoa no sistema.

**Campos Principais**:

- `id`: UUID único
- `email`, `phone`, `document`: Campos únicos
- `role`: Papel no sistema (master, admin, manager, executor, consultant)
- `status`: Estado do usuário (ACTIVE, DELETED, PENDING)

**Relações**:

- Pode ser **admin** de uma `Subscription`
- Pode ser **admin** de várias `Company`
- Pode ser **membro** de empresas via `CompanyUser`
- Pode ser **gestor** de equipes (`Team`)
- Pode ser **membro** de equipes via `TeamUser`

**Regras**:

- Um usuário pode ter múltiplos papéis em diferentes empresas
- Um usuário não pode ter múltiplos papéis na mesma empresa (constraint única)

---

### 2. **Plan** (Plano)

**Descrição**: Define os limites de recursos disponíveis.

**Campos de Limite**:

- `maxCompanies`: Máximo de empresas que o admin pode criar
- `maxManagers`: Máximo total de gestores (soma de todas as empresas)
- `maxExecutors`: Máximo total de executores (soma de todas as empresas)
- `maxConsultants`: Máximo total de consultores (soma de todas as empresas)
- `iaCallsLimit`: Limite de tokens/chamadas IA por período

**Relações**:

- Pode ter várias `Subscription` ativas

**Regras**:

- Os limites são **globais** para todas as empresas do admin
- Não há limite por empresa individual

---

### 3. **Subscription** (Assinatura)

**Descrição**: Vincula um admin a um plano contratado.

**Campos Principais**:

- `adminId`: Usuário admin dono da assinatura
- `planId`: Plano contratado
- `isActive`: Se a assinatura está ativa
- `startedAt`: Data de início

**Relações**:

- Pertence a um `User` (admin)
- Pertence a um `Plan`
- Possui vários `IAUsage` (rastreamento de uso)

**Regras**:

- Um admin pode ter apenas uma subscription ativa por vez
- A subscription determina os limites para todas as empresas do admin
- Todas as validações de limite consultam a subscription ativa do admin

---

### 4. **Company** (Empresa)

**Descrição**: Organização criada por um admin.

**Campos Principais**:

- `adminId`: Admin dono da empresa
- `name`: Nome da empresa
- `description`: Descrição opcional

**Relações**:

- Pertence a um `User` (admin)
- Possui vários `CompanyUser` (membros)
- Possui várias `Team` (equipes)

**Regras**:

- Uma empresa pertence a apenas um admin
- Ao deletar uma empresa, remove todos os membros e equipes (cascade)

---

### 5. **CompanyUser** (Membro da Empresa)

**Descrição**: Relaciona usuários com empresas, definindo seu papel.

**Campos Principais**:

- `companyId`: Empresa
- `userId`: Usuário
- `role`: Papel na empresa (manager, executor, consultant)

**Relações**:

- Pertence a uma `Company`
- Pertence a um `User`

**Constraints**:

- `@@unique([companyId, userId])`: Um usuário não pode ter múltiplos papéis na mesma empresa

**Regras**:

- Um usuário pode ser membro de várias empresas com papéis diferentes
- O papel define as permissões e capacidades do usuário na empresa
- **Gestores** podem ser líderes de equipes
- **Executores** podem ser membros de equipes
- **Consultores** não participam de equipes

---

### 6. **Team** (Equipe)

**Descrição**: Agrupa gestores e executores dentro de uma empresa.

**Campos Principais**:

- `companyId`: Empresa à qual a equipe pertence
- `managerId`: Gestor responsável pela equipe
- `name`: Nome da equipe
- `description`: Descrição opcional
- `iaContext`: Contexto descritivo para uso da IA (opcional)

**Relações**:

- Pertence a uma `Company`
- Tem um `User` como gestor
- Possui vários `TeamUser` (executores membros)

**Regras**:

- Uma equipe pertence a apenas uma empresa
- Uma equipe tem exatamente um gestor
- O gestor deve estar cadastrado na empresa como `CompanyUser` com `role = manager`
- O `iaContext` é um texto livre que pode ser usado pela IA para gerar tarefas personalizadas para a equipe
- Gestores e admins podem definir/atualizar o `iaContext` da equipe
- Ao deletar a empresa, remove todas as equipes (cascade)

---

### 7. **TeamUser** (Membro da Equipe)

**Descrição**: Relaciona executores com equipes.

**Campos Principais**:

- `teamId`: Equipe
- `userId`: Usuário executor

**Relações**:

- Pertence a uma `Team`
- Pertence a um `User`

**Constraints**:

- `@@unique([teamId, userId])`: Um usuário não pode estar duplicado na mesma equipe

**Regras**:

- Apenas **executores** podem ser membros de equipes
- O executor deve estar cadastrado na empresa como `CompanyUser` com `role = executor`
- Um executor pode participar de várias equipes
- Ao deletar a equipe ou o usuário, remove o relacionamento (cascade)

---

### 8. **IAUsage** (Uso de IA)

**Descrição**: Rastreia o consumo de chamadas IA por subscription.

**Campos Principais**:

- `subscriptionId`: Subscription que gerou o uso
- `userId`: Usuário que utilizou (opcional)
- `companyId`: Empresa relacionada (opcional)
- `tokensUsed`: Quantidade de tokens consumidos

**Relações**:

- Pertence a uma `Subscription`

**Regras**:

- Cada uso de IA é registrado individualmente
- O total de tokens é somado por subscription
- O limite é verificado contra `plan.iaCallsLimit`
- Campos opcionais permitem rastreamento detalhado

---

## 🔗 Hierarquia e Relacionamentos

### Diagrama de Hierarquia

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

### Relacionamentos Detalhados

#### User → Subscription

- **Tipo**: 1:N (um admin pode ter várias subscriptions, mas apenas uma ativa)
- **Propósito**: Vincular admin ao plano contratado

#### Subscription → Plan

- **Tipo**: N:1 (várias subscriptions podem usar o mesmo plano)
- **Propósito**: Definir limites

#### User → Company

- **Tipo**: 1:N (um admin pode ter várias empresas)
- **Propósito**: Admin cria e gerencia empresas
- **Validação**: Limitado por `plan.maxCompanies`

#### Company → CompanyUser

- **Tipo**: 1:N (uma empresa pode ter vários membros)
- **Propósito**: Definir quem trabalha na empresa e em qual papel
- **Validação**: Limites por role (manager, executor, consultant)

#### Company → Team

- **Tipo**: 1:N (uma empresa pode ter várias equipes)
- **Propósito**: Organizar membros em equipes

#### Team → TeamUser

- **Tipo**: 1:N (uma equipe pode ter vários executores)
- **Propósito**: Definir quais executores pertencem à equipe

---

## ✅ Regras de Validação

### 1. Criação de Empresa

**Regra**: Validar limite de empresas do plano

**Processo**:

1. Buscar subscription ativa do admin
2. Contar empresas existentes do admin
3. Comparar com `plan.maxCompanies`
4. Se `count >= maxCompanies` → **ERRO**
5. Se `count < maxCompanies` → **PERMITIR**

**Comportamento**:

O sistema verifica se o admin já atingiu o limite máximo de empresas permitidas pelo seu plano. Se o limite foi atingido, a criação da nova empresa é bloqueada. Caso contrário, a empresa é criada normalmente e vinculada ao admin.

---

### 2. Adicionar Membro à Empresa

**Regra**: Validar limite de membros por role (manager, executor, consultant)

**Processo**:

1. Buscar subscription ativa do admin da empresa
2. Contar membros existentes com o mesmo role (em TODAS as empresas do admin)
3. Comparar com o limite correspondente:
   - `plan.maxManagers` (se role = manager)
   - `plan.maxExecutors` (se role = executor)
   - `plan.maxConsultants` (se role = consultant)
4. Se `count >= limit` → **ERRO**
5. Se `count < limit` → **PERMITIR**

**Comportamento**:

O sistema verifica o limite global de membros por role considerando todas as empresas do admin. A contagem é feita somando todos os membros com o mesmo role em todas as empresas, não apenas na empresa atual. Se o limite global foi atingido, a adição do novo membro é bloqueada. O sistema também verifica se o usuário já não está cadastrado na empresa para evitar duplicatas.

---

### 3. Criar Equipe

**Regra**: Validar que o gestor está cadastrado na empresa como manager

**Processo**:

1. Verificar se `managerId` existe como `CompanyUser` na empresa
2. Verificar se o role é `manager`
3. Se não encontrado ou role incorreto → **ERRO**
4. Se válido → **PERMITIR**

**Comportamento**:

O sistema garante que apenas usuários que já estão cadastrados na empresa com o papel de gestor podem ser designados como gestores de equipes. Isso mantém a integridade hierárquica: primeiro o usuário deve ser membro da empresa como gestor, depois pode ser designado para liderar uma equipe.

---

### 4. Adicionar Executor à Equipe

**Regra**: Validar que o executor está cadastrado na empresa como executor

**Processo**:

1. Buscar a equipe e sua empresa
2. Verificar se `userId` existe como `CompanyUser` na empresa
3. Verificar se o role é `executor`
4. Se não encontrado ou role incorreto → **ERRO**
5. Se válido → **PERMITIR**

**Nota**: O limite de executores já foi validado ao adicionar o usuário como `CompanyUser`.

**Comportamento**:

O sistema garante que apenas executores cadastrados na empresa podem ser adicionados às equipes. A validação verifica se o usuário já está na empresa com o papel correto antes de permitir sua inclusão na equipe. O sistema também previne duplicatas, impedindo que o mesmo executor seja adicionado duas vezes à mesma equipe.

---

### 5. Uso de Chamadas IA

**Regra**: Validar limite de tokens/chamadas IA do plano

**Processo**:

1. Buscar subscription ativa do admin
2. Somar todos os `tokensUsed` dos `IAUsage` da subscription
3. Comparar com `plan.iaCallsLimit`
4. Se `total >= limit` → **ERRO**
5. Se `total < limit` → **PERMITIR** e registrar uso

**Comportamento**:

O sistema rastreia cada uso de IA registrando a quantidade de tokens consumidos. Antes de processar uma nova chamada, o sistema soma todos os tokens já utilizados na subscription e verifica se o novo uso não excederá o limite do plano. Se o limite for atingido, a chamada é bloqueada. Caso contrário, o uso é processado e registrado para controle futuro.

---

## 📊 Limites e Controles

### Resumo dos Limites

| Limite      | Campo no Plan    | Escopo                           | Validação                                      |
| ----------- | ---------------- | -------------------------------- | ---------------------------------------------- |
| Empresas    | `maxCompanies`   | Por admin                        | Ao criar empresa                               |
| Gestores    | `maxManagers`    | Global (todas empresas do admin) | Ao adicionar CompanyUser com role = manager    |
| Executores  | `maxExecutors`   | Global (todas empresas do admin) | Ao adicionar CompanyUser com role = executor   |
| Consultores | `maxConsultants` | Global (todas empresas do admin) | Ao adicionar CompanyUser com role = consultant |
| Chamadas IA | `iaCallsLimit`   | Por subscription                 | Ao usar IA                                     |

### Contagem de Limites

**Importante**: Os limites de membros (managers, executors, consultants) são contados **globalmente** entre todas as empresas do admin, não por empresa individual.

**Exemplo**:

```
Admin com plano: maxManagers = 10

Empresa A: 3 managers
Empresa B: 4 managers
Empresa C: 3 managers
Total: 10 managers ✓

Tentar adicionar manager na Empresa A → ERRO (10 >= 10)
```

---

## 🔄 Fluxos de Operação

### Fluxo 1: Onboarding Completo

```
1. Criar User (admin)
   ↓
2. Criar Plan
   ↓
3. Criar Subscription (admin + plan)
   ↓
4. Criar Company (validar maxCompanies)
   ↓
5. Adicionar CompanyUser (manager) (validar maxManagers)
   ↓
6. Adicionar CompanyUser (executor) (validar maxExecutors)
   ↓
7. Criar Team (validar que manager existe)
   ↓
8. Adicionar TeamUser (validar que executor existe)
```

### Fluxo 2: Uso de IA

```
1. Usuário solicita uso de IA
   ↓
2. Identificar admin (via userId ou companyId)
   ↓
3. Buscar subscription ativa
   ↓
4. Calcular total de tokens usados
   ↓
5. Validar limite (total + novo uso <= limit)
   ↓
6. Se OK → Processar chamada IA
   ↓
7. Registrar IAUsage
```

### Fluxo 3: Adicionar Membro à Equipe

```
1. Admin solicita adicionar executor à equipe
   ↓
2. Buscar Team e Company
   ↓
3. Verificar se userId é CompanyUser na empresa
   ↓
4. Verificar se role = executor
   ↓
5. Verificar se não está duplicado na equipe
   ↓
6. Se OK → Criar TeamUser
```

---

## 🛡️ Constraints e Integridade

### Constraints de Banco de Dados

1. **User.email**: Único
2. **User.phone**: Único
3. **User.document**: Único
4. **CompanyUser**: `@@unique([companyId, userId])` - Um usuário não pode ter múltiplos papéis na mesma empresa
5. **TeamUser**: `@@unique([teamId, userId])` - Um usuário não pode estar duplicado na mesma equipe

### Cascade Deletes

1. **Company → CompanyUser**: Ao deletar empresa, remove todos os membros
2. **Company → Team**: Ao deletar empresa, remove todas as equipes
3. **Team → TeamUser**: Ao deletar equipe, remove todos os membros
4. **User → CompanyUser**: Ao deletar usuário, remove todos os relacionamentos com empresas
5. **User → TeamUser**: Ao deletar usuário, remove todos os relacionamentos com equipes

### Restrict Deletes

1. **User → Subscription**: Não permite deletar admin se houver subscription ativa
2. **User → Team (manager)**: Não permite deletar gestor se houver equipes gerenciadas
3. **Plan → Subscription**: Não permite deletar plano se houver subscriptions

---

## 📝 Notas Importantes

1. **Plano vinculado ao admin**: Todas as empresas do admin compartilham os limites do plano
2. **Limites globais**: Contagem de membros é feita entre todas as empresas, não por empresa
3. **Hierarquia obrigatória**: Para criar equipe, o gestor deve estar cadastrado como CompanyUser primeiro
4. **Hierarquia obrigatória**: Para adicionar executor à equipe, ele deve estar cadastrado como CompanyUser primeiro
5. **Consultores não participam de equipes**: Apenas managers e executors podem estar em equipes
6. **Subscription ativa**: Sempre buscar a subscription com `isActive = true`
7. **Validações em cascata**: Validações devem ser feitas na ordem correta (empresa → membro → equipe → membro de equipe)

---

## 🤖 Contexto de IA para Equipes

### Descrição

O campo `iaContext` no modelo `Team` permite que cada equipe defina um contexto descritivo personalizado que será usado pela IA ao gerar tarefas e demandas.

### Funcionalidade

- **Campo opcional**: `iaContext` é um campo de texto livre (TEXT no banco)
- **Personalização**: Cada equipe pode ter seu próprio contexto específico
- **Uso na IA**: O contexto é incluído no prompt enviado ao modelo de IA ao gerar tarefas

### Exemplo de Uso

Quando uma equipe define um contexto, por exemplo: "Equipe responsável por campanhas de mídia paga no setor de varejo. Foco em performance, conversão e otimização de ROI com base em dados semanais.", esse contexto é automaticamente incluído no prompt enviado à IA ao gerar tarefas para essa equipe.

O sistema combina o contexto da equipe com a instrução do usuário para criar prompts mais precisos e personalizados, resultando em tarefas mais relevantes e alinhadas com o trabalho específico da equipe.

### Regras de Acesso

- **Gestor da equipe**: Pode atualizar o `iaContext` da sua equipe
- **Admin da empresa**: Pode atualizar o `iaContext` de qualquer equipe da empresa
- **Outros usuários**: Não têm permissão para modificar

### Implementação Futura

1. **Endpoint para atualização**: Será criado um endpoint que permite gestores e admins atualizarem o contexto da equipe
2. **Validação de tamanho**: O sistema validará que o contexto não exceda um limite de caracteres (sugestão: 1000 caracteres)
3. **Uso na geração de tarefas**: O sistema sempre incluirá o contexto no prompt quando disponível, e usará um contexto genérico quando não houver contexto definido

### Benefícios

- **Personalização**: Cada equipe pode ter tarefas geradas com base no seu contexto específico
- **Relevância**: Tarefas mais precisas e alinhadas com o trabalho da equipe
- **Flexibilidade**: Contexto pode ser atualizado conforme a equipe evolui

---

**Documento criado em**: 2025-11-09
**Versão do Schema**: 1.0.0

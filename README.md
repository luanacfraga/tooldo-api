# Tooldo API

API REST desenvolvida com NestJS para a plataforma Tooldo - sistema de gestão empresarial com controle de planos, empresas, equipes e uso de IA.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Contribuindo](#contribuindo)

## 🎯 Sobre o Projeto

Tooldo é uma plataforma de gestão que permite:

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

## 🛠️ Tecnologias

- **Framework**: NestJS 11
- **Linguagem**: TypeScript 5.7
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest
- **Arquitetura**: Hexagonal (Clean Architecture)

## 📦 Pré-requisitos

- Node.js 18+ e npm
- PostgreSQL 14+
- Docker (opcional, para desenvolvimento com docker-compose)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd weedu-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/tooldo_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-me"
JWT_EXPIRES_IN="7d"

# Aplicação
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"

# Email (Opcional - se não configurado, emails serão logados no console)
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
EMAIL_FROM="noreply@tooldo.com"
EMAIL_FROM_NAME="Tooldo"
```

### 4. Configure o banco de dados

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate
```

## ⚙️ Configuração

### Variáveis de Ambiente

#### Obrigatórias

- `DATABASE_URL`: String de conexão PostgreSQL
- `JWT_SECRET`: Chave secreta para assinatura de tokens JWT (mínimo 32 caracteres)

#### Opcionais

- `JWT_EXPIRES_IN`: Tempo de expiração do token (padrão: `7d`)
- `NODE_ENV`: Ambiente de execução (padrão: `development`)
- `PORT`: Porta da aplicação (padrão: `3000`)
- `FRONTEND_URL`: URL do frontend para links de email
- `ALLOWED_ORIGINS`: Origens permitidas para CORS (separadas por vírgula)

#### Configuração de Email

Para habilitar o envio real de emails, configure:

- `SMTP_USER`: Usuário do servidor SMTP
- `SMTP_PASSWORD`: Senha do servidor SMTP
- `SMTP_HOST`: Host do servidor SMTP (padrão: `smtp.gmail.com`)
- `SMTP_PORT`: Porta do servidor SMTP (padrão: `587`)
- `EMAIL_FROM`: Email remetente
- `EMAIL_FROM_NAME`: Nome do remetente

**Nota**: Se `SMTP_USER` e `SMTP_PASSWORD` não estiverem configurados, os emails serão apenas logados no console (modo desenvolvimento).

## 🏃 Executando o Projeto

### Desenvolvimento

```bash
# Modo watch (recompila automaticamente)
npm run start:dev

# Modo debug
npm run start:debug
```

### Produção

```bash
# Build
npm run build

# Executar
npm run start:prod
```

### Docker Compose (Desenvolvimento)

```bash
# Iniciar banco de dados
docker-compose up -d

# Executar migrações
npm run prisma:migrate
```

## 📁 Estrutura do Projeto

```
src/
├── api/                    # Camada de Apresentação (Controllers)
│   ├── auth/              # Autenticação
│   ├── company/           # Empresas
│   ├── employee/          # Funcionários
│   └── shared/            # Recursos compartilhados
│
├── application/            # Camada de Aplicação
│   ├── services/          # Use cases / Services
│   ├── modules/          # Application modules
│   ├── mappers/           # Domain to DTO mappers
│   └── events/            # Event listeners
│
├── core/                   # Camada de Domínio
│   ├── domain/            # Entidades de domínio
│   └── ports/             # Interfaces/Contratos
│       ├── repositories/  # Repository interfaces
│       └── services/      # Service interfaces
│
├── infra/                  # Camada de Infraestrutura
│   ├── database/          # Prisma e repositórios
│   ├── services/          # Implementações de serviços
│   └── config/            # Configurações
│
└── shared/                 # Código compartilhado
    └── constants/         # Constantes e mensagens
```

Para mais detalhes sobre a arquitetura, consulte [MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md).

## 📚 Documentação

### Documentação Principal

- **[COMECE_AQUI.md](./COMECE_AQUI.md)**: Guia rápido para começar com o deploy AWS
- **[BUSINESS_RULES.md](./BUSINESS_RULES.md)**: Regras de negócio e estrutura de dados
- **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**: Padrões de código e arquitetura

### Documentação Técnica

- **[docs/API_FLOWS.md](./docs/API_FLOWS.md)**: Fluxos da API e endpoints disponíveis
- **[docs/ERROR_HANDLING.md](./docs/ERROR_HANDLING.md)**: Sistema de tratamento de erros
- **[docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md)**: Referência rápida para deploy

### Documentação de Deploy

- **[docs/AWS_DEPLOY.md](./docs/AWS_DEPLOY.md)**: Guia completo de deploy na AWS
- **[docs/DEPLOY_STEP_BY_STEP.md](./docs/DEPLOY_STEP_BY_STEP.md)**: Passo a passo detalhado
- **[docs/SECRETS_MANAGER_GUIDE.md](./docs/SECRETS_MANAGER_GUIDE.md)**: Configuração do Secrets Manager
- **[scripts/README.md](./scripts/README.md)**: Documentação dos scripts de deploy

### Swagger/OpenAPI

Após iniciar o servidor, acesse a documentação interativa:

```
http://localhost:3000/api/docs
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento

```bash
npm run start:dev      # Inicia em modo watch
npm run start:debug   # Inicia em modo debug
npm run build         # Compila o projeto
```

### Banco de Dados

```bash
npm run prisma:generate    # Gera cliente Prisma
npm run prisma:migrate     # Executa migrações
npm run prisma:studio      # Abre Prisma Studio
npm run prisma:reset       # Reseta o banco (CUIDADO!)
```

### Qualidade de Código

```bash
npm run lint          # Executa ESLint e corrige
npm run lint:check    # Verifica sem corrigir
npm run format        # Formata código com Prettier
npm run format:check  # Verifica formatação
npm run typecheck     # Verifica tipos TypeScript
npm run validate      # Executa todas as validações
```

### Testes

```bash
npm run test          # Executa testes unitários
npm run test:watch    # Executa testes em modo watch
npm run test:cov      # Executa testes com cobertura
npm run test:e2e      # Executa testes end-to-end
```

### Deploy

```bash
# Build e push para ECR
./scripts/build-and-push-ecr.sh latest

# Deploy completo
./scripts/deploy.sh latest tooldo-api tooldo-api

# Executar migrações
./scripts/run-migrations.sh <cluster> <task-def> <subnet1> <subnet2> <sg>
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm run test

# Testes específicos
npm run test -- employee.service.spec.ts

# Com cobertura
npm run test:cov
```

### Estrutura de Testes

- Testes unitários: `src/**/*.spec.ts`
- Testes E2E: `test/**/*.e2e-spec.ts`

## 📝 Padrões de Código

Este projeto segue padrões rigorosos de código. Consulte:

- **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**: Padrões completos de implementação

### Regras Principais

- ❌ **NUNCA** usar arquivos `index.ts`
- ❌ **NUNCA** adicionar comentários no código
- ❌ **NUNCA** usar `console.log` em produção
- ❌ **NUNCA** usar tipos `any` sem justificativa
- ❌ **NUNCA** desabilitar regras do ESLint no código

## 🚀 Deploy

### Deploy Local

```bash
npm run build
npm run start:prod
```

### Deploy AWS

Consulte a documentação completa:

- **[COMECE_AQUI.md](./COMECE_AQUI.md)**: Guia rápido
- **[docs/DEPLOY_STEP_BY_STEP.md](./docs/DEPLOY_STEP_BY_STEP.md)**: Passo a passo detalhado
- **[docs/AWS_DEPLOY.md](./docs/AWS_DEPLOY.md)**: Guia completo

## 🤝 Contribuindo

1. Leia os padrões de código em [MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)
2. Execute `npm run validate` antes de commitar
3. Siga os padrões de commit do projeto
4. Crie testes para novas funcionalidades

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em `docs/`
2. Verifique os logs da aplicação
3. Consulte a seção de Troubleshooting nos guias de deploy

---

**Desenvolvido com ❤️ para Tooldo**

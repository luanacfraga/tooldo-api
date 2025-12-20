# Tooldo API

API REST desenvolvida com NestJS para a plataforma Tooldo - sistema de gestão empresarial com controle de planos, empresas, equipes e uso de IA.

## 🚀 Comece Aqui

**Novo no projeto?** Siga o guia rápido: **[COMECE_AQUI.md](./COMECE_AQUI.md)**

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
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

Para detalhes completos, consulte: **[docs/TECNOLOGIAS.md](./docs/TECNOLOGIAS.md)**

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

Para mais detalhes sobre a arquitetura, consulte: **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**

## 📚 Documentação

### 📖 Documentação Principal

- **[COMECE_AQUI.md](./COMECE_AQUI.md)**: Guia rápido para começar
- **[BUSINESS_RULES.md](./BUSINESS_RULES.md)**: Regras de negócio e estrutura de dados
- **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**: Padrões de código e arquitetura
- **[STATUS_AWS.md](./STATUS_AWS.md)**: Status atual dos recursos AWS

### 📂 Documentação Técnica Detalhada

Toda a documentação técnica está organizada na pasta **[docs/](./docs/)**:

#### 🚀 Para Começar

- **[docs/SETUP_LOCAL.md](./docs/SETUP_LOCAL.md)**: Setup completo para desenvolvimento local
- **[docs/AWS_ACCESS.md](./docs/AWS_ACCESS.md)**: Configuração de acesso AWS (onboarding)
- ⭐ **[docs/CICD.md](./docs/CICD.md)**: Deploy automático via Git (recomendado)
- **[docs/DEPLOY.md](./docs/DEPLOY.md)**: Deploy manual quando infraestrutura já existe

#### 🏗️ Infraestrutura

- **[docs/AWS_DEPLOY.md](./docs/AWS_DEPLOY.md)**: Guia completo para criar infraestrutura AWS do zero

#### 🔧 Operação

- **[docs/SCRIPTS.md](./docs/SCRIPTS.md)**: Documentação completa dos scripts disponíveis
- **[docs/PRE_DEPLOY_CHECKLIST.md](./docs/PRE_DEPLOY_CHECKLIST.md)**: Checklist de validação pré-deploy

#### 📖 Referência Técnica

- **[docs/TECNOLOGIAS.md](./docs/TECNOLOGIAS.md)**: Detalhes técnicos das tecnologias usadas

### 📄 Swagger/OpenAPI

Após iniciar o servidor, acesse a documentação interativa:

```
http://localhost:3000/api/docs
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento

```bash
npm run start:dev      # Inicia em modo watch
npm run start:debug    # Inicia em modo debug
npm run build          # Compila o projeto
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
npm run validate      # Executa todas as validações (typecheck + lint + format)
npm run pre-deploy    # Validação completa pré-deploy (recomendado antes de publicar)
```

### Testes

```bash
npm run test          # Executa testes unitários
npm run test:watch    # Executa testes em modo watch
npm run test:cov      # Executa testes com cobertura
npm run test:e2e      # Executa testes end-to-end
```

### Deploy

#### ⭐ Deploy Automático (Recomendado)

O projeto possui **pipeline CI/CD** configurada com GitHub Actions que faz deploy automaticamente:

- **Push para `main` ou `master`**: Deploy automático completo
- **Tags `v*`**: Deploy por versão
- **Manual**: Via GitHub Actions UI

Consulte: **[docs/CICD.md](./docs/CICD.md)** para detalhes da pipeline.

#### Deploy Manual

Para deploy manual ou quando a infraestrutura precisa ser atualizada:

- **[COMECE_AQUI.md](./COMECE_AQUI.md)**: Guia rápido
- **[docs/DEPLOY.md](./docs/DEPLOY.md)**: Deploy manual quando infra já existe
- **[docs/AWS_DEPLOY.md](./docs/AWS_DEPLOY.md)**: Criar infraestrutura do zero

## 📝 Padrões de Código

Este projeto segue padrões rigorosos de código. Consulte:

- **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**: Padrões completos de implementação

### Regras Principais

- ❌ **NUNCA** usar arquivos `index.ts`
- ❌ **NUNCA** adicionar comentários no código
- ❌ **NUNCA** usar `console.log` em produção
- ❌ **NUNCA** usar tipos `any` sem justificativa
- ❌ **NUNCA** desabilitar regras do ESLint no código

## 🤝 Contribuindo

1. Leia os padrões de código em **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**
2. Execute `npm run pre-deploy` antes de fazer deploy ou push para produção
3. Execute `npm run validate` antes de commitar
4. Siga os padrões de commit do projeto
5. Crie testes para novas funcionalidades

## 📄 Licença

Este projeto é privado e proprietário.

## 🆘 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação em **[docs/](./docs/)**
2. Verifique os logs da aplicação
3. Consulte a seção de Troubleshooting nos guias de deploy

---

**Desenvolvido com ❤️ para Tooldo**

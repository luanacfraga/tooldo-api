# Tecnologias - Tooldo API

Principais tecnologias e ferramentas usadas no projeto Tooldo API.

## 🛠️ Stack Principal

### Framework e Linguagem

- **NestJS 11**: Framework Node.js para construção de aplicações server-side escaláveis
- **TypeScript 5.7**: Linguagem de programação com tipagem estática
- **Node.js 18+**: Runtime JavaScript (recomendado 20+)

### Banco de Dados

- **PostgreSQL 14+**: Banco de dados relacional
- **Prisma ORM**: ORM moderno para TypeScript e Node.js
  - Migrações automáticas
  - Type-safe database client
  - Prisma Studio para visualização

### Autenticação e Segurança

- **JWT (JSON Web Tokens)**: Autenticação stateless
- **Passport.js**: Middleware de autenticação para NestJS
- **bcrypt**: Hash de senhas
- **class-validator**: Validação de DTOs
- **class-transformer**: Transformação de objetos

### Documentação

- **Swagger/OpenAPI**: Documentação interativa da API
- Acessível em: `http://localhost:3000/api/docs`

### Testes

- **Jest**: Framework de testes
- **Supertest**: Testes E2E de HTTP

### Qualidade de Código

- **ESLint**: Linter JavaScript/TypeScript
- **Prettier**: Formatador de código
- **TypeScript Compiler**: Verificação de tipos

## 🐳 Containerização

- **Docker**: Containerização da aplicação
- **Docker Compose**: Orquestração local (PostgreSQL)

## ☁️ Infraestrutura AWS

- **ECR (Elastic Container Registry)**: Registro de imagens Docker
- **ECS (Elastic Container Service)**: Orquestração de containers
  - Fargate: Serverless containers
- **RDS PostgreSQL**: Banco de dados gerenciado
- **ALB (Application Load Balancer)**: Balanceador de carga
- **ACM (AWS Certificate Manager)**: Certificados SSL/TLS
- **Secrets Manager**: Gerenciamento de segredos
- **CloudWatch Logs**: Logs centralizados
- **VPC**: Rede virtual privada

## 📦 Gerenciamento de Dependências

- **npm**: Gerenciador de pacotes Node.js

## 🔧 Ferramentas de Desenvolvimento

- **Prisma Studio**: Interface visual para o banco de dados
- **Git**: Controle de versão
- **GitHub Actions**: CI/CD

## 📚 Documentação Oficial

- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **AWS ECS**: https://docs.aws.amazon.com/ecs/

## 🏗️ Arquitetura

O projeto segue **Arquitetura Hexagonal (Clean Architecture)**:

- **Camada de Apresentação** (`api/`): Controllers e DTOs
- **Camada de Aplicação** (`application/`): Use cases e services
- **Camada de Domínio** (`core/`): Entidades e interfaces
- **Camada de Infraestrutura** (`infra/`): Implementações concretas

Para mais detalhes, consulte: **[MEMORY_BANK_PADROES.md](../MEMORY_BANK_PADROES.md)**

## 🔗 Links Úteis

- **[SETUP_LOCAL.md](./SETUP_LOCAL.md)**: Como configurar o ambiente local
- **[MEMORY_BANK_PADROES.md](../MEMORY_BANK_PADROES.md)**: Padrões de código do projeto
- **[BUSINESS_RULES.md](../BUSINESS_RULES.md)**: Regras de negócio

---

**Última atualização:** 2024-12-16

# 🚀 Comece Aqui

> **Guia rápido para novos desenvolvedores**

Este guia fornece um caminho claro para começar a trabalhar no projeto Tooldo API. Escolha o caminho que se aplica à sua situação.

## 🎯 Escolha seu Caminho

### 👨‍💻 Desenvolvedor Local (Desenvolvimento)

Se você vai **desenvolver e testar localmente**:

👉 **[docs/SETUP_LOCAL.md](./docs/SETUP_LOCAL.md)** - Setup completo para desenvolvimento local

**Resumo rápido:**

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env (copiar de .env.example)
cp .env.example .env

# 3. Subir banco local (opcional)
docker-compose up -d

# 4. Configurar Prisma
npm run prisma:generate
npm run prisma:migrate

# 5. Rodar API
npm run start:dev
```

### 🚀 Deploy AWS (Produção)

Se você vai **fazer deploy na AWS**:

#### ⭐ Opção A: Deploy Automático via Git (Recomendado)

**A forma mais simples:** A pipeline CI/CD faz deploy automaticamente quando você faz push para `main` ou `master`.

👉 **[docs/CICD.md](./docs/CICD.md)** - Pipeline CI/CD com GitHub Actions

**Como funciona:**

```bash
# 1. Faça suas alterações e commit
git add .
git commit -m "feat: nova funcionalidade"

# 2. Push para main/master
git push origin main

# ✅ Deploy automático! A pipeline:
#    - Valida código (typecheck + lint + tests)
#    - Faz build da imagem Docker
#    - Faz push para ECR
#    - Atualiza serviço ECS automaticamente
```

**Também disponível:**
- Deploy manual via GitHub Actions UI
- Deploy por tags (ex: `v1.0.0`)

#### Opção B: Deploy Manual (Scripts)

Se você precisa fazer deploy manualmente ou a infraestrutura precisa ser atualizada:

👉 **[docs/DEPLOY.md](./docs/DEPLOY.md)** - Deploy manual quando infra já existe

**Resumo rápido:**

```bash
# 1. Build e push para ECR
./scripts/build-and-push-ecr.sh latest

# 2. Deploy no ECS
./scripts/deploy.sh latest tooldo-api tooldo-api

# 3. Migrações (se necessário)
./scripts/run-migrations.sh <cluster> <task> <subnet1> <subnet2> <sg>
```

#### Opção C: Criar Infraestrutura do Zero

Se você precisa criar toda a infraestrutura AWS (VPC, RDS, ECS, ALB, etc.):

👉 **[docs/AWS_DEPLOY.md](./docs/AWS_DEPLOY.md)** - Guia completo de infraestrutura

**Pré-requisitos:**

1. **[docs/AWS_ACCESS.md](./docs/AWS_ACCESS.md)** - Configurar acesso AWS
2. Seguir o guia passo a passo em **[docs/AWS_DEPLOY.md](./docs/AWS_DEPLOY.md)**

## 📚 Documentação Essencial

### Para Entender o Projeto

- **[README.md](./README.md)**: Visão geral do projeto
- **[BUSINESS_RULES.md](./BUSINESS_RULES.md)**: Regras de negócio e estrutura de dados
- **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**: Padrões de código e arquitetura

### Para Operar o Projeto

- **[docs/](./docs/)**: Documentação técnica completa (veja README.md principal)
- **[STATUS_AWS.md](./STATUS_AWS.md)**: Status atual dos recursos AWS
- **[docs/SCRIPTS.md](./docs/SCRIPTS.md)**: Documentação dos scripts disponíveis
- **[docs/CICD.md](./docs/CICD.md)**: Pipeline CI/CD

## ✅ Checklist Rápido

### Antes de Começar

- [ ] Leia o **[README.md](./README.md)** para entender o projeto
- [ ] Escolha seu caminho (desenvolvimento local ou deploy)
- [ ] Configure o ambiente seguindo o guia apropriado

### Antes de Fazer Deploy

- [ ] Execute `npm run pre-deploy` para validação completa
- [ ] Consulte **[docs/PRE_DEPLOY_CHECKLIST.md](./docs/PRE_DEPLOY_CHECKLIST.md)**
- [ ] Verifique **[STATUS_AWS.md](./STATUS_AWS.md)** para status atual

### Antes de Commitar

- [ ] Execute `npm run validate` (typecheck + lint + format)
- [ ] Siga os padrões em **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**
- [ ] Crie testes para novas funcionalidades

## 🆘 Precisa de Ajuda?

### Troubleshooting

1. **Problemas de setup local?**
   - Consulte **[docs/SETUP_LOCAL.md](./docs/SETUP_LOCAL.md)**
   - Verifique logs: `npm run start:dev`

2. **Problemas de deploy?**
   - Consulte **[docs/DEPLOY.md](./docs/DEPLOY.md)** (seção Troubleshooting)
   - Verifique logs: `aws logs tail /ecs/tooldo-api --follow --region us-east-1`
   - Consulte **[STATUS_AWS.md](./STATUS_AWS.md)**

3. **Dúvidas sobre código?**
   - Consulte **[MEMORY_BANK_PADROES.md](./MEMORY_BANK_PADROES.md)**
   - Consulte **[BUSINESS_RULES.md](./BUSINESS_RULES.md)**

### Links Úteis

- **Swagger/OpenAPI**: `http://localhost:3000/api/docs` (quando rodando localmente)
- **Prisma Studio**: `npm run prisma:studio`
- **Documentação NestJS**: https://docs.nestjs.com
- **Documentação Prisma**: https://www.prisma.io/docs

---

**Bem-vindo ao projeto Tooldo API! 🎉**

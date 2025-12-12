# 📚 Documentação Técnica - Tooldo API

Bem-vindo à documentação técnica da API Tooldo. Este diretório contém toda a documentação necessária para entender, desenvolver e fazer deploy da aplicação.

## 📋 Índice de Documentação

### 🚀 Guias de Início Rápido

- **[COMECE_AQUI.md](../COMECE_AQUI.md)** (raiz do projeto)
  - Guia rápido para começar com o deploy AWS
  - Checklist de passos essenciais
  - Comandos rápidos

### 📖 Documentação de Negócio

- **[BUSINESS_RULES.md](../BUSINESS_RULES.md)** (raiz do projeto)
  - Regras de negócio completas
  - Estrutura de entidades e relacionamentos
  - Limites e validações
  - Fluxos de operação

### 🏗️ Documentação de Arquitetura

- **[MEMORY_BANK_PADROES.md](../MEMORY_BANK_PADROES.md)** (raiz do projeto)
  - Padrões de código e arquitetura
  - Estrutura de pastas
  - Nomenclatura e convenções
  - Regras de tipagem e ESLint

### 🔌 Documentação da API

- **[API_FLOWS.md](./API_FLOWS.md)**
  - Fluxos implementados
  - Endpoints disponíveis
  - Estrutura de dados
  - Exemplos de requisições e respostas
  - Autenticação e autorização

### ⚠️ Tratamento de Erros

- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)**
  - Arquitetura de tratamento de erros
  - Exceções de domínio
  - Filtros globais
  - Mensagens centralizadas
  - Boas práticas

### 🚀 Guias de Deploy

#### Deploy AWS - Visão Geral

- **[AWS_DEPLOY.md](./AWS_DEPLOY.md)**
  - Arquitetura completa
  - Pré-requisitos
  - Variáveis de ambiente
  - Configuração de infraestrutura
  - Troubleshooting

#### Deploy AWS - Passo a Passo

- **[DEPLOY_STEP_BY_STEP.md](./DEPLOY_STEP_BY_STEP.md)**
  - Guia detalhado passo a passo
  - Build e push para ECR
  - Configuração de Secrets Manager
  - Criação de Task Definition
  - Criação de Serviço ECS
  - Configuração de ALB
  - Execução de migrações

#### Referência Rápida

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
  - Comandos rápidos
  - URLs importantes
  - Configurações de Secrets
  - Variáveis de ambiente
  - Troubleshooting rápido

#### Secrets Manager

- **[SECRETS_MANAGER_GUIDE.md](./SECRETS_MANAGER_GUIDE.md)**
  - Como criar segredos
  - Scripts automatizados
  - Configuração manual
  - Permissões necessárias

### 🛠️ Scripts

- **[scripts/README.md](../scripts/README.md)**
  - Documentação de todos os scripts
  - Uso e exemplos
  - Pré-requisitos

## 🗺️ Mapa de Navegação

### Para Desenvolvedores Novos

1. Comece com **[README.md](../README.md)** para visão geral
2. Leia **[MEMORY_BANK_PADROES.md](../MEMORY_BANK_PADROES.md)** para padrões
3. Consulte **[API_FLOWS.md](./API_FLOWS.md)** para entender a API
4. Veja **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** para tratamento de erros

### Para Deploy

1. Comece com **[COMECE_AQUI.md](../COMECE_AQUI.md)** para visão geral
2. Siga **[DEPLOY_STEP_BY_STEP.md](./DEPLOY_STEP_BY_STEP.md)** para passos detalhados
3. Consulte **[AWS_DEPLOY.md](./AWS_DEPLOY.md)** para referência completa
4. Use **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** para comandos rápidos

### Para Entender o Negócio

1. Leia **[BUSINESS_RULES.md](../BUSINESS_RULES.md)** completo
2. Consulte **[API_FLOWS.md](./API_FLOWS.md)** para ver implementação

## 📝 Convenções de Documentação

- **Emojis**: Usados para facilitar navegação visual
- **Índices**: Todos os documentos longos têm índices
- **Exemplos**: Código e comandos sempre com exemplos práticos
- **Links**: Navegação entre documentos relacionadas
- **Atualização**: Documentos incluem data de criação/atualização quando relevante

## 🔄 Atualizações

Esta documentação é mantida junto com o código. Ao adicionar novas funcionalidades:

1. Atualize **[API_FLOWS.md](./API_FLOWS.md)** se adicionar endpoints
2. Atualize **[BUSINESS_RULES.md](../BUSINESS_RULES.md)** se mudar regras de negócio
3. Atualize **[MEMORY_BANK_PADROES.md](../MEMORY_BANK_PADROES.md)** se mudar padrões
4. Atualize este índice se adicionar novos documentos

## 🆘 Precisa de Ajuda?

1. Consulte a seção de Troubleshooting nos guias específicos
2. Verifique os logs da aplicação
3. Consulte a documentação do NestJS: https://docs.nestjs.com

---

**Última atualização**: 2025-12-11

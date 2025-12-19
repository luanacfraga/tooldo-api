# Checklist de Validação Pré-Deploy

Este documento descreve o processo completo de validação que deve ser executado antes de publicar/deployar a API na produção.

## 🎯 Objetivo

Garantir que o código está pronto para produção, validando:
- ✅ Tipos TypeScript corretos
- ✅ Código seguindo padrões de lint
- ✅ Formatação consistente
- ✅ Testes passando
- ✅ Build de produção funcionando

## 🚀 Como Usar

### Método 1: Script Automático (Recomendado)

Execute o script de validação pré-deploy:

```bash
npm run pre-deploy
```

Ou diretamente:

```bash
./scripts/pre-deploy-check.sh
```

Este script executa automaticamente todas as validações e para na primeira falha encontrada.

### Método 2: Validação Manual

Execute cada comando individualmente:

```bash
# 1. Gerar cliente Prisma
npm run prisma:generate

# 2. Verificar tipos TypeScript
npm run typecheck

# 3. Verificar lint
npm run lint:check

# 4. Verificar formatação
npm run format:check

# 5. Executar testes
npm run test

# 6. Build de produção
npm run build
```

### Método 3: Validação Rápida

Para uma validação rápida (sem testes):

```bash
npm run validate
```

Este comando executa apenas: typecheck + lint + format check.

## 📋 Checklist Completo

### 1. Dependências ✅

- [ ] Todas as dependências estão instaladas (`node_modules` existe)
- [ ] Não há dependências faltando ou com versões conflitantes

**Comando:**
```bash
npm install
```

### 2. Cliente Prisma ✅

- [ ] Cliente Prisma está gerado e atualizado
- [ ] Schema do Prisma está sincronizado

**Comando:**
```bash
npm run prisma:generate
```

### 3. TypeScript ✅

- [ ] Sem erros de tipo
- [ ] Todas as importações estão corretas
- [ ] Tipos estão bem definidos

**Comando:**
```bash
npm run typecheck
```

**O que verifica:**
- Erros de tipo TypeScript
- Importações inválidas
- Tipos não definidos ou incorretos

### 4. Lint ✅

- [ ] Código segue as regras do ESLint
- [ ] Não há problemas de qualidade de código

**Comando:**
```bash
npm run lint:check
```

**Para corrigir automaticamente:**
```bash
npm run lint:fix
```

**O que verifica:**
- Regras do ESLint
- Padrões de código
- Boas práticas

### 5. Formatação ✅

- [ ] Código está formatado corretamente
- [ ] Consistência de estilo

**Comando:**
```bash
npm run format:check
```

**Para formatar automaticamente:**
```bash
npm run format
```

**O que verifica:**
- Formatação Prettier
- Indentação
- Quebras de linha
- Espaçamento

### 6. Testes ✅

- [ ] Todos os testes unitários passam
- [ ] Cobertura de testes adequada

**Comando:**
```bash
npm run test
```

**Com cobertura:**
```bash
npm run test:cov
```

**O que verifica:**
- Testes unitários
- Funcionalidades críticas
- Regras de negócio

### 7. Build de Produção ✅

- [ ] Build compila sem erros
- [ ] Arquivo `dist/main.js` é gerado
- [ ] Aplicação pode ser executada em produção

**Comando:**
```bash
npm run build
```

**Para testar localmente:**
```bash
npm run build
npm run start:prod
```

**O que verifica:**
- Compilação TypeScript → JavaScript
- Geração de arquivos de produção
- Dependências de build

## 🔍 Validações Adicionais (Opcionais)

### Testes E2E

Para validar fluxos completos da API:

```bash
npm run test:e2e
```

**Requisitos:**
- Banco de dados de teste configurado
- Variáveis de ambiente de teste configuradas

### Verificação de Variáveis de Ambiente

Antes do deploy, certifique-se de que todas as variáveis necessárias estão configuradas:

**Obrigatórias:**
- `DATABASE_URL` - String de conexão PostgreSQL
- `JWT_SECRET` - Chave secreta JWT (mínimo 32 caracteres)

**Opcionais (mas recomendadas):**
- `NODE_ENV=production`
- `PORT=3000`
- `FRONTEND_URL` - URL do frontend
- `ALLOWED_ORIGINS` - Origens CORS permitidas

Para mais detalhes, consulte [docs/AWS_DEPLOY.md](./AWS_DEPLOY.md).

### Verificação de Migrações

Certifique-se de que as migrações do banco de dados estão prontas:

```bash
npm run prisma:migrate:deploy
```

**⚠️ Atenção:** Este comando aplica migrações pendentes. Use apenas em ambiente de produção quando tiver certeza.

## 🚨 O que Fazer se Algo Falhar

### Erros de Tipo TypeScript

1. Execute `npm run typecheck` para ver os erros detalhados
2. Corrija os erros de tipo
3. Execute novamente a validação

### Problemas de Lint

1. Execute `npm run lint:fix` para corrigir automaticamente
2. Se persistir, corrija manualmente
3. Execute `npm run lint:check` novamente

### Problemas de Formatação

1. Execute `npm run format` para formatar automaticamente
2. Execute `npm run format:check` novamente

### Testes Falhando

1. Execute `npm run test` para ver detalhes dos testes que falharam
2. Corrija os problemas nos testes ou no código
3. Execute novamente

### Build Falhando

1. Execute `npm run build` para ver erros detalhados
2. Verifique se há problemas de importação ou dependências
3. Corrija e execute novamente

## 📊 Integração com CI/CD

O pipeline de CI/CD (GitHub Actions) executa automaticamente estas validações antes de fazer deploy:

1. **Pull Request**: Executa validações completas (`.github/workflows/ci.yml`)
2. **Push para main/master**: Executa validações + build + deploy (`.github/workflows/deploy.yml`)

### Validações no CI/CD

O pipeline executa:
- ✅ Type check
- ✅ Lint check
- ✅ Format check
- ✅ Testes com cobertura
- ✅ Build de produção

Se qualquer validação falhar no CI/CD, o deploy não será executado.

## 💡 Dicas

1. **Execute `npm run pre-deploy` antes de fazer commit** para garantir que tudo está OK
2. **Use `npm run validate` para validação rápida** antes de commitar
3. **Configure um pre-commit hook** (opcional) para executar validações automaticamente
4. **Mantenha os testes atualizados** quando adicionar novas funcionalidades
5. **Verifique os logs do CI/CD** se algo falhar no deploy automático

## 🔗 Referências

- `AWS_DEPLOY.md` (infra do zero)
- `DEPLOY.md` (infra já pronta)

---

**Lembre-se:** Sempre execute `npm run pre-deploy` antes de fazer deploy manual ou push para produção! 🚀


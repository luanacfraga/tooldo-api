# 🚀 GitHub Actions - CI/CD Pipeline

Este diretório contém as configurações de CI/CD usando GitHub Actions.

## 📋 Workflows Disponíveis

### 1. `ci.yml` - Validação e Testes

Executa automaticamente em:

- Pull Requests para `main` ou `master`
- Pushes em branches que não sejam `main` ou `master`

**O que faz:**

- ✅ Type checking
- ✅ Linter
- ✅ Formatação
- ✅ Testes com cobertura

### 2. `deploy.yml` - Deploy Automático

Executa automaticamente em:

- Push para `main` ou `master`
- Criação de tags `v*` (ex: `v1.0.0`)
- Execução manual via `workflow_dispatch`

**O que faz:**

- ✅ Executa testes e validações
- ✅ Build da imagem Docker
- ✅ Push para Amazon ECR
- ✅ Deploy no ECS

## 🔐 Configuração de Secrets

Para que a pipeline funcione, você precisa configurar os seguintes secrets no GitHub:

1. Acesse: `Settings` → `Secrets and variables` → `Actions`
2. Adicione os seguintes secrets:

| Secret                  | Descrição                | Como obter                                       |
| ----------------------- | ------------------------ | ------------------------------------------------ |
| `AWS_ACCESS_KEY_ID`     | Access Key ID da AWS     | AWS Console → IAM → Users → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key da AWS | AWS Console → IAM → Users → Security credentials |

### Permissões Necessárias na AWS

O usuário/role da AWS precisa ter as seguintes permissões:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["ecs:UpdateService", "ecs:DescribeServices"],
      "Resource": "arn:aws:ecs:us-east-1:114700956661:service/tooldo-api/*"
    }
  ]
}
```

### Como Criar um Usuário IAM do Zero

Se você não tem um usuário IAM ainda, siga estes passos:

1. **Acessar IAM:**
   - AWS Console → IAM (ou https://console.aws.amazon.com/iam)
   - Menu lateral: `Users`

2. **Criar novo usuário:**
   - Clique em `Create user`
   - Nome do usuário: `github-actions-tooldo` (ou outro nome de sua preferência)
   - Clique em `Next`

3. **Configurar permissões:**
   - Selecione `Attach policies directly`
   - Clique em `Create policy`
   - Na nova aba que abrir, selecione `JSON`
   - Cole a política JSON acima (substitua o ARN do serviço ECS se necessário)
   - Clique em `Next`
   - Nome da política: `GitHubActionsTooldoPolicy`
   - Descrição: `Permissões para GitHub Actions fazer deploy no ECS`
   - Clique em `Create policy`
   - Volte para a aba anterior e clique no ícone de atualizar (🔄)
   - Procure e selecione a política `GitHubActionsTooldoPolicy`
   - Clique em `Next`

4. **Revisar e criar:**
   - Revise as informações
   - Clique em `Create user`

5. **Criar Access Key:**
   - Clique no usuário recém-criado
   - Aba `Security credentials`
   - Seção `Access keys` → `Create access key`
   - Siga os passos descritos na seção de troubleshooting acima

## 🎯 Como Usar

### Deploy Automático (Push para main/master)

Simplesmente faça push para a branch `main` ou `master`:

```bash
git checkout main
git push origin main
```

A pipeline irá:

1. Executar testes
2. Fazer build e push da imagem
3. Fazer deploy no ECS

### Deploy com Tag

Para fazer deploy de uma versão específica:

```bash
git tag v1.0.0
git push origin v1.0.0
```

A imagem será taggeada com `v1.0.0` e `latest`.

### Deploy Manual

1. Acesse: `Actions` → `Deploy to AWS ECS`
2. Clique em `Run workflow`
3. Escolha a branch
4. Digite a tag da imagem (opcional, padrão: `latest`)
5. Clique em `Run workflow`

## 📊 Monitoramento

Após cada execução, você pode:

- Ver o status na aba `Actions` do GitHub
- Ver logs detalhados de cada step
- Ver o resumo do deploy no final

## 🔍 Troubleshooting

### Erro: "Credentials could not be loaded, please check your action inputs"

Este erro indica que as credenciais AWS não estão configuradas corretamente no GitHub.

**📋 Checklist Rápido:**

- [ ] Secrets existem no GitHub? (`AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`)
- [ ] Nomes dos secrets estão corretos? (case-sensitive)
- [ ] Credenciais AWS estão ativas?
- [ ] Usuário IAM tem as permissões necessárias?
- [ ] Workflow está usando `${{ secrets.AWS_ACCESS_KEY_ID }}`?

**Siga estes passos detalhados:**

1. **Verificar se os secrets existem:**
   - Acesse: `Settings` → `Secrets and variables` → `Actions`
   - Verifique se existem os secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
   - **IMPORTANTE**: Os nomes devem ser exatamente como acima (case-sensitive)

2. **Criar/Atualizar os secrets:**
   - Se não existirem, clique em `New repository secret`
   - Nome: `AWS_ACCESS_KEY_ID`
   - Valor: Sua Access Key ID da AWS (ex: `AKIAIOSFODNN7EXAMPLE`)
   - Clique em `Add secret`
   - Repita para `AWS_SECRET_ACCESS_KEY`

3. **Verificar/criar credenciais AWS:**
   - AWS Console → IAM → Users → Seu usuário → Security credentials
   - Seção `Access keys` → Verifique se está `Active`
   - Se necessário, `Create access key` → `Application running outside AWS`
   - **CRÍTICO**: Copie imediatamente Access Key ID e Secret Access Key (só aparece uma vez)
   - Atualize os secrets no GitHub: `Settings` → `Secrets and variables` → `Actions`

4. **Verificar permissões do usuário IAM:**
   - O usuário precisa ter as permissões listadas na seção "Permissões Necessárias na AWS" acima
   - Verifique se as políticas estão anexadas corretamente

5. **Verificar se o workflow está usando os secrets corretamente:**
   - O workflow deve usar: `${{ secrets.AWS_ACCESS_KEY_ID }}`
   - E: `${{ secrets.AWS_SECRET_ACCESS_KEY }}`
   - Não use variáveis de ambiente ou valores hardcoded

6. **Testar credenciais localmente (opcional):**
   ```bash
   aws sts get-caller-identity
   aws ecr describe-repositories --repository-names tooldo-api
   aws ecs describe-services --cluster tooldo-api --services tooldo-api
   ```

### Erro: "The security token included in the request is invalid"

Este erro indica que as credenciais AWS no GitHub são inválidas, expiradas ou diferentes das locais.

**Soluções rápidas:**

1. **Verificar credenciais locais:**
   ```bash
   aws configure get aws_access_key_id
   cat ~/.aws/credentials
   ```

2. **Atualizar secrets no GitHub:**
   - Use a mesma `AWS_ACCESS_KEY_ID` que funciona localmente
   - Verifique se não há espaços extras ao copiar/colar
   - `AWS_ACCESS_KEY_ID` deve começar com `AKIA`
   - `AWS_SECRET_ACCESS_KEY` deve ter 40 caracteres

3. **Se necessário, criar novas credenciais:**
   - AWS Console → IAM → Users → Security credentials → Create access key
   - Copie imediatamente (Secret Key só aparece uma vez)
   - Atualize ambos os secrets no GitHub

### Erro: "AWS credentials not configured"

- Verifique se os secrets `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` existem no GitHub
- Verifique se os nomes estão exatamente como acima (case-sensitive)

### Erro: "Repository not found"

- Verifique se o repositório ECR existe
- Verifique se as permissões estão corretas

### Erro: "Service not found"

- Verifique se o cluster e serviço ECS existem
- Verifique os nomes: `tooldo-api` (cluster e serviço)

### Deploy não atualiza o serviço

- Verifique se a Task Definition está usando a imagem correta
- Verifique os logs do ECS para ver se há erros

## 📝 Notas

- A pipeline usa a tag do commit SHA (8 primeiros caracteres) para branches
- Para tags, usa o nome da tag
- A imagem `latest` é sempre atualizada junto com a tag específica
- O deploy aguarda a estabilização do serviço antes de finalizar

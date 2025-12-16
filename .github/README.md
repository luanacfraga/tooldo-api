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

3. **Verificar as credenciais AWS:**

   **Passo a passo detalhado:**

   a. **Acessar o AWS Console:**
   - Acesse: https://console.aws.amazon.com
   - Faça login com sua conta AWS

   b. **Navegar para IAM:**
   - No menu superior, procure por "IAM" ou acesse diretamente: https://console.aws.amazon.com/iam
   - No menu lateral esquerdo, clique em `Users`

   c. **Selecionar o usuário:**
   - Encontre o usuário que você usa para o GitHub Actions
   - Se não tiver um usuário específico, você pode usar um existente ou criar um novo
   - Clique no nome do usuário para abrir os detalhes

   d. **Acessar Security credentials:**
   - Na página do usuário, clique na aba `Security credentials`
   - Role a página até a seção `Access keys`

   e. **Verificar credenciais existentes:**
   - Se já existir uma Access Key, verifique se está `Active`
   - Se estiver `Inactive`, você pode ativá-la ou criar uma nova
   - **IMPORTANTE**: Se você não tem a Secret Access Key salva, não conseguirá recuperá-la. Nesse caso, você precisará criar uma nova

   f. **Criar novas credenciais (se necessário):**
   - Clique em `Create access key`
   - Selecione o caso de uso: `Application running outside AWS` ou `Command Line Interface (CLI)`
   - Marque a caixa de confirmação
   - Clique em `Next`
   - (Opcional) Adicione uma descrição como "GitHub Actions CI/CD"
   - Clique em `Create access key`
   - **CRÍTICO**: Copie imediatamente:
     - `Access key ID` (ex: `AKIAIOSFODNN7EXAMPLE`)
     - `Secret access key` (ex: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - **ATENÇÃO**: A Secret Access Key só é mostrada UMA VEZ. Se você fechar a janela sem copiar, precisará criar uma nova
   - Clique em `Done`

   g. **Atualizar os secrets no GitHub:**
   - Volte ao GitHub: `Settings` → `Secrets and variables` → `Actions`
   - Se já existir `AWS_ACCESS_KEY_ID`, clique nele e depois em `Update`
   - Se não existir, clique em `New repository secret`
   - Cole o `Access key ID` no campo `Value`
   - Clique em `Update secret` ou `Add secret`
   - Repita o processo para `AWS_SECRET_ACCESS_KEY` com o `Secret access key`

4. **Verificar permissões do usuário IAM:**
   - O usuário precisa ter as permissões listadas na seção "Permissões Necessárias na AWS" acima
   - Verifique se as políticas estão anexadas corretamente

5. **Verificar se o workflow está usando os secrets corretamente:**
   - O workflow deve usar: `${{ secrets.AWS_ACCESS_KEY_ID }}`
   - E: `${{ secrets.AWS_SECRET_ACCESS_KEY }}`
   - Não use variáveis de ambiente ou valores hardcoded

6. **Testar as credenciais localmente (opcional):**

   Você pode testar se as credenciais estão funcionando usando a AWS CLI:

   ```bash
   # Configurar as credenciais temporariamente
   export AWS_ACCESS_KEY_ID="sua-access-key-id"
   export AWS_SECRET_ACCESS_KEY="sua-secret-access-key"
   export AWS_DEFAULT_REGION="us-east-1"

   # Testar acesso ao ECR
   aws ecr describe-repositories --repository-names tooldo-api

   # Testar acesso ao ECS
   aws ecs describe-services --cluster tooldo-api --services tooldo-api
   ```

   Se esses comandos funcionarem, suas credenciais estão corretas e têm as permissões necessárias.

### Erro: "The security token included in the request is invalid"

Este erro indica que as credenciais AWS configuradas no GitHub são inválidas, expiradas ou diferentes das que funcionam localmente.

**⚠️ Diagnóstico Rápido:**

- Você tem 2 Access Keys ativas no AWS
- O GitHub pode estar usando uma diferente da que funciona localmente
- Ou a Secret Access Key no GitHub está incorreta/expirada

**Soluções:**

1. **Verificar se as credenciais no GitHub são as mesmas que funcionam localmente:**

   ```bash
   # Ver suas credenciais locais
   aws configure list
   # ou
   cat ~/.aws/credentials
   ```

   - Compare o `AWS_ACCESS_KEY_ID` local com o secret no GitHub
   - Se forem diferentes, atualize o secret no GitHub

2. **Verificar se há espaços em branco ou caracteres extras:**
   - Ao copiar/colar as credenciais, podem ter sido adicionados espaços
   - Edite os secrets no GitHub e remova espaços no início/fim
   - Certifique-se de que não há quebras de linha

3. **Criar novas credenciais AWS:**

   Se as credenciais expiraram ou você não tem certeza:

   a. Acesse AWS Console → IAM → Users → `luana-fraga` (ou seu usuário)
   b. Aba `Security credentials`
   c. Seção `Access keys`
   d. Se já existir uma key ativa, você pode:
   - Deletar a antiga (se não souber a secret key)
   - Criar uma nova
     e. Clique em `Create access key`
     f. Copie o `Access key ID` e `Secret access key`
     g. **IMPORTANTE**: Atualize os secrets no GitHub imediatamente

4. **Atualizar os secrets no GitHub:**
   - Acesse: `Settings` → `Secrets and variables` → `Actions`
   - Clique em `AWS_ACCESS_KEY_ID` → `Update`
   - Cole o novo `Access key ID` (sem espaços)
   - Clique em `Update secret`
   - Repita para `AWS_SECRET_ACCESS_KEY`

5. **Verificar o formato das credenciais:**
   - `AWS_ACCESS_KEY_ID` deve começar com `AKIA` (ex: `AKIAIOSFODNN7EXAMPLE`)
   - `AWS_SECRET_ACCESS_KEY` deve ter 40 caracteres (ex: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - Não deve conter espaços, quebras de linha ou caracteres especiais além do necessário

6. **Testar as novas credenciais localmente antes de usar no GitHub:**

   ```bash
   export AWS_ACCESS_KEY_ID="nova-access-key-id"
   export AWS_SECRET_ACCESS_KEY="nova-secret-access-key"
   export AWS_DEFAULT_REGION="us-east-1"

   aws sts get-caller-identity
   aws ecr describe-repositories --repository-names tooldo-api
   ```

### Erro: "AWS credentials not configured"

- Verifique se os secrets `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão configurados
- Verifique se as credenciais estão corretas
- Verifique se os nomes dos secrets estão exatamente como no workflow (case-sensitive)

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

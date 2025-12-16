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

### Erro: "AWS credentials not configured"

- Verifique se os secrets `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão configurados
- Verifique se as credenciais estão corretas

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

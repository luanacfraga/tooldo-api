# CI/CD (GitHub Actions)

Workflows ficam em `.github/workflows/`.

## `ci.yml`

Validações: typecheck + lint + format + tests.

## `deploy.yml`

Build Docker + push ECR + update-service ECS.

### Secrets necessários (GitHub)

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

# 🚀 CI/CD (GitHub Actions)

Este projeto usa **GitHub Actions** para validação (CI) e deploy automático (CD) na AWS.

## Workflows

### 1) `ci.yml` — Validação e testes

**Quando roda**

- Pull Request para `main` ou `master`
- Push em branches que **não** sejam `main`/`master`

**O que faz**

- Typecheck
- Lint
- Format check
- Testes com cobertura

Arquivo: `.github/workflows/ci.yml`

---

### 2) `deploy.yml` — Deploy automático (ECR + ECS)

**Quando roda**

- Push para `main` ou `master`
- Tags `v*` (ex.: `v1.0.0`)
- Manual (`workflow_dispatch`) com input `tag` (default: `latest`)

**O que faz**

- Executa validações e testes
- Build da imagem Docker (`linux/amd64`)
- Push para ECR (tag do deploy + `latest`)
- Força novo deployment no ECS e aguarda estabilização

Arquivo: `.github/workflows/deploy.yml`

## Secrets necessários no GitHub

Configurar em: `Settings` → `Secrets and variables` → `Actions`

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

> Os workflows usam `aws-actions/configure-aws-credentials` com esses secrets.

## Permissões mínimas (AWS IAM)

O usuário/role usado pelo GitHub Actions precisa, no mínimo, de permissões para:

- **ECR**: login e push
- **ECS**: `UpdateService` + `DescribeServices` (deploy)

Exemplo (ajuste conforme seu ambiente/ARNs):

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

## Como usar

### Deploy automático

- Push para `main`/`master` dispara o `deploy.yml`.

### Deploy por tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Deploy manual (GitHub UI)

- GitHub → **Actions** → **Deploy to AWS ECS** → **Run workflow**

## Troubleshooting (rápido)

- **Credenciais não carregam**: confira `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` nos Secrets do repo.
- **Token inválido**: credenciais expiradas/erradas — gere novas access keys no IAM e atualize os secrets.
- **Service not found**: valide nomes do cluster/serviço no `deploy.yml` (`ECS_CLUSTER`, `ECS_SERVICE`).

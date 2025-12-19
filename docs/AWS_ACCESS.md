# Setup de Acesso AWS (onboarding)

Este guia é para garantir que você consegue **acessar a AWS** e operar deploy.

## Região padrão

`us-east-1`

## 1) AWS CLI

Valide acesso:

```bash
aws sts get-caller-identity --region us-east-1
```

## 2) Permissões mínimas (alto nível)

- ECR (login/push/pull)
- ECS (update-service/describe/run-task)
- CloudWatch Logs (tail)
- Secrets Manager (ler/criar/atualizar segredos no setup inicial)

## 3) Secrets esperados

- `tooldo/db/prod` (JSON credenciais RDS)
- `tooldo/db/url` (DATABASE_URL completa) — recomendado
- `tooldo/jwt/secret` (string)

Criar/atualizar via script:

```bash
./scripts/create-secrets.sh
```

## Próximo passo

Deploy (infra já pronta): [DEPLOY.md](DEPLOY.md)



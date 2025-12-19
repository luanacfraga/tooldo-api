# Deploy (infra já pronta)

Este guia é para publicar uma nova versão na AWS quando a infraestrutura já existe.

## Pré-requisitos

- AWS CLI configurado
- Docker instalado
- Secrets configurados (ver [AWS_ACCESS.md](AWS_ACCESS.md))

## 1) Build + Push para ECR

```bash
./scripts/build-and-push-ecr.sh latest
```

## 2) Atualizar serviço ECS

```bash
./scripts/deploy.sh latest tooldo-api tooldo-api
```

## 3) Migrações (quando necessário)

```bash
./scripts/run-migrations.sh \
  tooldo-api \
  tooldo-api-task \
  subnet-xxxxx \
  subnet-yyyyy \
  sg-zzzzz
```

## 4) Verificar health

```bash
curl https://api.tooldo.net/api/v1/health
```

## 5) Ver logs

```bash
aws logs tail /ecs/tooldo-api --follow --region us-east-1
```

# Deploy (infra já pronta)

Este guia é para **atualizar a aplicação** em uma infraestrutura AWS que já existe (ECR/ECS/ALB/RDS já criados).

## Pré-requisitos

- AWS CLI configurado e com acesso
- Docker instalado e rodando
- Secrets já configurados (ver [AWS_ACCESS.md](AWS_ACCESS.md))

## 1) Build + Push para ECR

```bash
./scripts/build-and-push-ecr.sh latest
```

## 2) Atualizar serviço ECS (forçar novo deployment)

```bash
./scripts/deploy.sh latest tooldo-api tooldo-api
```

## 3) Migrações (quando necessário)

Quando houver migrações novas, rode via task one-off:

```bash
./scripts/run-migrations.sh \
  tooldo-api \
  tooldo-api-task \
  subnet-xxxxx \
  subnet-yyyyy \
  sg-zzzzz
```

## 4) Verificar saúde

```bash
curl https://api.tooldo.net/api/v1/health
```

## 5) Ver logs

```bash
aws logs tail /ecs/tooldo-api --follow --region us-east-1
```

## Se o deploy “não estabilizar” (services-stable timeout)

Quando o GitHub Actions mostra:

- `Waiter ServicesStable failed: Max attempts exceeded`

isso significa que o ECS **não conseguiu deixar o serviço saudável** dentro do tempo (em geral: tasks reiniciando, health check falhando, ou erro de configuração).

Checklist rápido:

- Ver `docs/STATUS_AWS.md` e confirme **health check**: `/api/v1/health`
- Verifique logs no CloudWatch: `aws logs tail /ecs/tooldo-api --follow --region us-east-1`
- Verifique eventos do serviço (Console ECS → Service → Events)

## Infra (primeira vez / criar do zero)

Se você precisa criar a infraestrutura (VPC/RDS/ALB/ACM etc.), use:

- [AWS_DEPLOY.md](AWS_DEPLOY.md)

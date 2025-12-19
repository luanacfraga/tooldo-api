# Scripts

Scripts essenciais ficam em `scripts/`.

## Deploy

- `./scripts/build-and-push-ecr.sh <tag>`
- `./scripts/deploy.sh <tag> <cluster> <service>`

## Migrações

- `./scripts/run-migrations.sh <cluster> <task-def> <subnet1> <subnet2> <sg>`

## Secrets

- `./scripts/create-secrets.sh`

## Pré-deploy

- `npm run pre-deploy` (recomendado)
- `./scripts/pre-deploy-check.sh`



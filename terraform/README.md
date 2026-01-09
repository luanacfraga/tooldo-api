# Terraform - Tooldo API Infrastructure

Esta configuração Terraform gerencia os recursos AWS da Tooldo API que mudam frequentemente: secrets e configuração do ECS.

## Estrutura

```
terraform/
├── backend.tf              # Configuração do Terraform e provider AWS
├── variables.tf            # Declaração de todas as variáveis
├── data.tf                 # Referências a recursos AWS existentes
├── secrets.tf              # AWS Secrets Manager
├── ecs.tf                  # ECS Task Definition e Service
├── outputs.tf              # Outputs úteis
├── terraform.tfvars        # Valores não-sensíveis (commitado)
├── secrets.tfvars.example  # Template para valores sensíveis
└── secrets.tfvars          # Valores sensíveis (gitignored)
```

## Recursos Gerenciados

### ✅ Gerenciado pelo Terraform

- **Secrets Manager**
  - `tooldo/db/url` - DATABASE_URL completa
  - `tooldo/jwt/secret` - JWT secret
  - `tooldo/resend/api-key` - Resend API key
- **ECS Task Definition** - Configuração completa do container
- **ECS Service** - Serviço com rolling updates
- **CloudWatch Log Group** - Logs da aplicação

### 🔗 Apenas Referenciado (não modificado)

- VPC, Subnets, Security Groups
- RDS PostgreSQL
- ALB e Target Group
- ECR Repository
- IAM Roles

## Setup Inicial

### 1. Instalar Terraform

```bash
# macOS
brew install terraform

# Verificar instalação
terraform version
```

### 2. Configurar Credenciais AWS

Certifique-se que suas credenciais AWS estão configuradas:

```bash
aws sts get-caller-identity
```

### 3. Criar arquivo de secrets

```bash
cd terraform/

# Copiar template
cp secrets.tfvars.example secrets.tfvars

# Editar com valores reais
nano secrets.tfvars
```

Preencha `secrets.tfvars` com os valores reais:

```hcl
db_user     = "postgres"
db_password = "sua-senha-real-do-rds"
jwt_secret  = "seu-jwt-secret-real"
resend_api_key = "re_sua_chave_real"
```

### 4. Inicializar Terraform

```bash
terraform init
```

Isso irá:
- Baixar o provider AWS
- Configurar o backend local
- Preparar o ambiente

### 5. Importar Recursos Existentes

Como alguns recursos já existem na AWS, precisamos importá-los:

```bash
# Importar secrets existentes (se já existem)
terraform import aws_secretsmanager_secret.database_url tooldo/db/url
terraform import aws_secretsmanager_secret.jwt_secret tooldo/jwt/secret

# Se os secrets não existirem, pule este passo
# O Terraform vai criá-los automaticamente
```

### 6. Revisar Mudanças

```bash
terraform plan -var-file="secrets.tfvars"
```

Revise cuidadosamente o que será criado/modificado.

### 7. Aplicar Configuração

```bash
terraform apply -var-file="secrets.tfvars"
```

Digite `yes` para confirmar.

## Uso Diário

### Atualizar Variáveis de Ambiente

1. Editar valores em `terraform.tfvars` (não-sensíveis) ou `secrets.tfvars` (sensíveis)

2. Ver o que vai mudar:
```bash
terraform plan -var-file="secrets.tfvars"
```

3. Aplicar mudanças:
```bash
terraform apply -var-file="secrets.tfvars"
```

O Terraform irá:
- Atualizar secrets no Secrets Manager
- Criar nova revisão da task definition
- Fazer rolling update do serviço ECS (zero downtime)

### Atualizar Imagem Docker

Para fazer deploy de uma nova versão:

```bash
# 1. Build e push da imagem (fora do Terraform)
../scripts/build-and-push-ecr.sh v1.2.3

# 2. Atualizar tag no terraform.tfvars
# Editar: image_tag = "v1.2.3"

# 3. Aplicar
terraform apply -var-file="secrets.tfvars"
```

Ou use a variável diretamente:

```bash
terraform apply -var-file="secrets.tfvars" -var="image_tag=v1.2.3"
```

### Forçar Redeploy

Para forçar redeploy sem mudanças:

```bash
terraform apply -var-file="secrets.tfvars" -replace="aws_ecs_service.app"
```

### Ver Outputs

```bash
terraform output
```

Outputs úteis:
- `current_image` - Imagem atualmente deployada
- `task_definition_revision` - Revisão atual da task definition
- `database_url_secret_arn` - ARN do secret DATABASE_URL

### Ver Logs

```bash
# Verificar logs da aplicação
aws logs tail /ecs/tooldo-api --follow

# Ver últimas 100 linhas
aws logs tail /ecs/tooldo-api --since 1h
```

## Workflows Comuns

### Adicionar Nova Variável de Ambiente

1. Adicionar em `variables.tf`:
```hcl
variable "nova_variavel" {
  description = "Descrição da variável"
  type        = string
  default     = "valor-padrao"
}
```

2. Adicionar em `ecs.tf` na seção `environment`:
```hcl
{
  name  = "NOVA_VARIAVEL"
  value = var.nova_variavel
}
```

3. Adicionar valor em `terraform.tfvars`:
```hcl
nova_variavel = "valor-real"
```

4. Aplicar:
```bash
terraform apply -var-file="secrets.tfvars"
```

### Adicionar Novo Secret

1. Adicionar variável em `variables.tf`:
```hcl
variable "novo_secret" {
  description = "Novo secret"
  type        = string
  sensitive   = true
}
```

2. Criar secret em `secrets.tf`:
```hcl
resource "aws_secretsmanager_secret" "novo_secret" {
  name        = "tooldo/novo/secret"
  description = "Descrição do secret"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "novo_secret" {
  secret_id     = aws_secretsmanager_secret.novo_secret.id
  secret_string = var.novo_secret
}
```

3. Adicionar em `ecs.tf` na seção `secrets`:
```hcl
{
  name      = "NOVO_SECRET"
  valueFrom = aws_secretsmanager_secret.novo_secret.arn
}
```

4. Adicionar em `secrets.tfvars`:
```hcl
novo_secret = "valor-secreto"
```

5. Aplicar:
```bash
terraform apply -var-file="secrets.tfvars"
```

### Aumentar Recursos (CPU/Memória)

Editar `terraform.tfvars`:

```hcl
task_cpu    = "1024"  # 1 vCPU (era 512)
task_memory = "2048"  # 2 GB (era 1024)
```

Aplicar:
```bash
terraform apply -var-file="secrets.tfvars"
```

### Escalar Número de Tasks

Editar `terraform.tfvars`:

```hcl
desired_count = 2  # 2 tasks (era 1)
```

Aplicar:
```bash
terraform apply -var-file="secrets.tfvars"
```

## Troubleshooting

### Erro: Secret já existe

Se o secret já existe na AWS:

```bash
# Importar o secret
terraform import aws_secretsmanager_secret.database_url tooldo/db/url

# Depois aplicar normalmente
terraform apply -var-file="secrets.tfvars"
```

### Erro: ECS Service já existe

```bash
# Importar service
terraform import aws_ecs_service.app tooldo-api/tooldo-api

# Depois aplicar normalmente
terraform apply -var-file="secrets.tfvars"
```

### Erro: Diferenças no state

```bash
# Atualizar state sem modificar recursos
terraform refresh -var-file="secrets.tfvars"
```

### Rollback de Deploy

Se o deploy falhou:

```bash
# Voltar para tag anterior
terraform apply -var-file="secrets.tfvars" -var="image_tag=v1.2.2"
```

### Ver State Atual

```bash
# Listar recursos gerenciados
terraform state list

# Ver detalhes de um recurso
terraform state show aws_ecs_task_definition.app
```

## Boas Práticas

1. **Sempre use `plan` antes de `apply`**
   ```bash
   terraform plan -var-file="secrets.tfvars"
   ```

2. **Nunca commite `secrets.tfvars`**
   - Já está no `.gitignore`
   - Mantenha backups seguros localmente

3. **Documente mudanças importantes**
   - Use mensagens de commit descritivas
   - Atualize este README se necessário

4. **Teste em horário de baixo tráfego**
   - Rolling updates são zero-downtime, mas teste primeiro

5. **Monitore após deploy**
   ```bash
   # Ver logs em tempo real
   aws logs tail /ecs/tooldo-api --follow

   # Verificar health do service
   aws ecs describe-services --cluster tooldo-api --services tooldo-api
   ```

## Migração Futura

### Backend Remoto (S3)

Para colaboração em time, migre para S3 backend:

1. Criar bucket S3 e tabela DynamoDB para lock
2. Descomentar configuração em `backend.tf`
3. Executar `terraform init -migrate-state`

### Múltiplos Ambientes

Para criar ambientes staging/dev:

1. Criar workspaces:
```bash
terraform workspace new staging
terraform workspace new production
```

2. Usar variáveis por workspace
3. Manter `secrets.tfvars` separados por ambiente

## Comandos Rápidos

```bash
# Setup inicial
terraform init

# Ver mudanças
terraform plan -var-file="secrets.tfvars"

# Aplicar
terraform apply -var-file="secrets.tfvars"

# Aplicar sem confirmação (CI/CD)
terraform apply -var-file="secrets.tfvars" -auto-approve

# Ver outputs
terraform output

# Forçar redeploy
terraform apply -var-file="secrets.tfvars" -replace="aws_ecs_service.app"

# Destruir tudo (cuidado!)
terraform destroy -var-file="secrets.tfvars"
```

## Suporte

Para dúvidas ou problemas:
1. Verificar [documentação oficial do Terraform](https://www.terraform.io/docs)
2. Verificar [provider AWS](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
3. Revisar logs no CloudWatch

# Makefile para facilitar comandos Terraform
# Uso: make <comando>

.PHONY: help init plan apply deploy destroy output logs

# Arquivo de secrets
SECRETS_FILE := secrets.tfvars

# Cores para output
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m

help: ## Mostrar esta mensagem de ajuda
	@echo "$(GREEN)Comandos disponíveis:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

init: ## Inicializar Terraform
	@echo "$(GREEN)Inicializando Terraform...$(NC)"
	terraform init

plan: ## Ver mudanças que serão aplicadas
	@echo "$(GREEN)Planejando mudanças...$(NC)"
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "$(YELLOW)AVISO: $(SECRETS_FILE) não encontrado. Copie secrets.tfvars.example para secrets.tfvars$(NC)"; \
		exit 1; \
	fi
	terraform plan -var-file="$(SECRETS_FILE)"

apply: ## Aplicar mudanças (interativo)
	@echo "$(GREEN)Aplicando mudanças...$(NC)"
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "$(YELLOW)AVISO: $(SECRETS_FILE) não encontrado. Copie secrets.tfvars.example para secrets.tfvars$(NC)"; \
		exit 1; \
	fi
	terraform apply -var-file="$(SECRETS_FILE)"

deploy: ## Deploy rápido (sem confirmação - use com cuidado)
	@echo "$(GREEN)Fazendo deploy...$(NC)"
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "$(YELLOW)AVISO: $(SECRETS_FILE) não encontrado. Copie secrets.tfvars.example para secrets.tfvars$(NC)"; \
		exit 1; \
	fi
	terraform apply -var-file="$(SECRETS_FILE)" -auto-approve

output: ## Mostrar outputs
	@terraform output

logs: ## Ver logs da aplicação
	@echo "$(GREEN)Mostrando logs (Ctrl+C para sair)...$(NC)"
	@aws logs tail /ecs/tooldo-api --follow

validate: ## Validar arquivos Terraform
	@echo "$(GREEN)Validando configuração...$(NC)"
	terraform validate

fmt: ## Formatar arquivos Terraform
	@echo "$(GREEN)Formatando arquivos...$(NC)"
	terraform fmt -recursive

state-list: ## Listar recursos no state
	@terraform state list

refresh: ## Atualizar state sem modificar recursos
	@echo "$(GREEN)Atualizando state...$(NC)"
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "$(YELLOW)AVISO: $(SECRETS_FILE) não encontrado. Copie secrets.tfvars.example para secrets.tfvars$(NC)"; \
		exit 1; \
	fi
	terraform refresh -var-file="$(SECRETS_FILE)"

destroy: ## Destruir todos os recursos (CUIDADO!)
	@echo "$(YELLOW)AVISO: Isso vai destruir recursos!$(NC)"
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "$(YELLOW)AVISO: $(SECRETS_FILE) não encontrado. Copie secrets.tfvars.example para secrets.tfvars$(NC)"; \
		exit 1; \
	fi
	terraform destroy -var-file="$(SECRETS_FILE)"

redeploy: ## Forçar redeploy do ECS service
	@echo "$(GREEN)Forçando redeploy...$(NC)"
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "$(YELLOW)AVISO: $(SECRETS_FILE) não encontrado. Copie secrets.tfvars.example para secrets.tfvars$(NC)"; \
		exit 1; \
	fi
	terraform apply -var-file="$(SECRETS_FILE)" -replace="aws_ecs_service.app"

setup: ## Setup inicial completo
	@echo "$(GREEN)Setup inicial...$(NC)"
	@if [ ! -f $(SECRETS_FILE) ]; then \
		echo "$(YELLOW)Criando $(SECRETS_FILE) a partir do template...$(NC)"; \
		cp secrets.tfvars.example $(SECRETS_FILE); \
		echo "$(YELLOW)IMPORTANTE: Edite $(SECRETS_FILE) com os valores reais antes de continuar!$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Inicializando Terraform...$(NC)"
	terraform init
	@echo "$(GREEN)Validando configuração...$(NC)"
	terraform validate
	@echo "$(GREEN)Setup concluído! Execute 'make plan' para revisar as mudanças.$(NC)"

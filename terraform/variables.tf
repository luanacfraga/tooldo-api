# ==========================================
# AWS Configuration
# ==========================================

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
  default     = "114700956661"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# ==========================================
# Existing Infrastructure (Data Sources)
# ==========================================

variable "vpc_id" {
  description = "Existing VPC ID"
  type        = string
  default     = "vpc-00a0060753dc70f6a"
}

variable "private_subnet_ids" {
  description = "Existing private subnet IDs for ECS tasks"
  type        = list(string)
  default     = ["subnet-09ab5020804730fad", "subnet-0fa1ecd517dc8fef4"]
}

variable "app_security_group_id" {
  description = "Existing security group ID for ECS tasks"
  type        = string
  default     = "sg-076a3eb059fcdc88e"
}

variable "target_group_arn" {
  description = "Existing ALB target group ARN"
  type        = string
  default     = ""  # Will be fetched via data source
}

variable "execution_role_name" {
  description = "Existing ECS task execution role name"
  type        = string
  default     = "ecs_tasks_execution_role-weedu-weedu-api-prod"
}

# ==========================================
# Database Configuration
# ==========================================

variable "db_host" {
  description = "RDS database host"
  type        = string
  default     = "tooldo-db.cmvj2jytztco.us-east-1.rds.amazonaws.com"
}

variable "db_port" {
  description = "RDS database port"
  type        = string
  default     = "5432"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "tooldo-db"
}

variable "db_user" {
  description = "Database username (sensitive)"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password (sensitive)"
  type        = string
  sensitive   = true
}

# ==========================================
# Application Secrets
# ==========================================

variable "jwt_secret" {
  description = "JWT secret key (sensitive)"
  type        = string
  sensitive   = true
}

variable "resend_api_key" {
  description = "Resend API key for email (sensitive)"
  type        = string
  sensitive   = true
}

# ==========================================
# Application Configuration
# ==========================================

variable "node_env" {
  description = "Node environment"
  type        = string
  default     = "production"
}

variable "app_port" {
  description = "Application port"
  type        = string
  default     = "3000"
}

variable "allowed_origins" {
  description = "CORS allowed origins"
  type        = string
  default     = "https://www.tooldo.app,https://tooldo.app,https://www.tooldo.net,https://tooldo.net"
}

variable "frontend_url" {
  description = "Frontend URL"
  type        = string
  default     = "https://www.tooldo.app"
}

variable "email_from" {
  description = "Email sender address"
  type        = string
  default     = "onboarding@resend.dev"
}

variable "email_from_name" {
  description = "Email sender name"
  type        = string
  default     = "Tooldo"
}

# ==========================================
# ECS Configuration
# ==========================================

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "tooldo-api"
}

variable "service_name" {
  description = "ECS service name"
  type        = string
  default     = "tooldo-api"
}

variable "task_family" {
  description = "ECS task definition family name"
  type        = string
  default     = "tooldo-api-task"
}

variable "container_name" {
  description = "Container name in task definition"
  type        = string
  default     = "tooldo-api"
}

variable "ecr_repository_name" {
  description = "ECR repository name"
  type        = string
  default     = "tooldo-api"
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "task_cpu" {
  description = "Task CPU units (256 = 0.25 vCPU, 512 = 0.5 vCPU, 1024 = 1 vCPU)"
  type        = string
  default     = "512"
}

variable "task_memory" {
  description = "Task memory in MB"
  type        = string
  default     = "1024"
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 1
}

# ==========================================
# CloudWatch Logs
# ==========================================

variable "log_group_name" {
  description = "CloudWatch log group name"
  type        = string
  default     = "/ecs/tooldo-api"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

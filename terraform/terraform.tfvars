# ==========================================
# Tooldo API - Terraform Variables
# Non-sensitive values (safe to commit)
# ==========================================

# AWS Configuration
aws_region     = "us-east-1"
aws_account_id = "114700956661"
environment    = "production"

# Existing Infrastructure
vpc_id                 = "vpc-00a0060753dc70f6a"
private_subnet_ids     = ["subnet-09ab5020804730fad", "subnet-0fa1ecd517dc8fef4"]
app_security_group_id  = "sg-076a3eb059fcdc88e"
execution_role_name    = "ecs_tasks_execution_role-weedu-weedu-api-prod"

# Database Configuration (non-sensitive)
db_host = "tooldo-db.cmvj2jytztco.us-east-1.rds.amazonaws.com"
db_port = "5432"
db_name = "tooldo-db"

# Application Configuration
node_env        = "production"
app_port        = "3000"
allowed_origins = "https://www.tooldo.app,https://tooldo.app,https://www.tooldo.net,https://tooldo.net"
frontend_url    = "https://www.tooldo.app"
email_from      = "onboarding@resend.dev"
email_from_name = "Tooldo"

# ECS Configuration
cluster_name        = "tooldo-api"
service_name        = "tooldo-api"
task_family         = "tooldo-api-task"
container_name      = "tooldo-api"
ecr_repository_name = "tooldo-api"
image_tag           = "latest"
task_cpu            = "512"
task_memory         = "1024"
desired_count       = 1

# CloudWatch Logs
log_group_name     = "/ecs/tooldo-api"
log_retention_days = 7

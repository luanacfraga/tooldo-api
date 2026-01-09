# ==========================================
# Outputs
# ==========================================

output "task_definition_arn" {
  description = "ARN of the ECS task definition"
  value       = aws_ecs_task_definition.app.arn
}

output "task_definition_revision" {
  description = "Revision number of the ECS task definition"
  value       = aws_ecs_task_definition.app.revision
}

output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.app.name
}

output "service_id" {
  description = "ID of the ECS service"
  value       = aws_ecs_service.app.id
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = data.aws_ecs_cluster.main.cluster_name
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = data.aws_ecr_repository.app.repository_url
}

output "current_image" {
  description = "Current deployed image"
  value       = "${data.aws_ecr_repository.app.repository_url}:${var.image_tag}"
}

output "database_url_secret_arn" {
  description = "ARN of the DATABASE_URL secret"
  value       = aws_secretsmanager_secret.database_url.arn
}

output "jwt_secret_arn" {
  description = "ARN of the JWT_SECRET secret"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "resend_api_key_secret_arn" {
  description = "ARN of the RESEND_API_KEY secret"
  value       = aws_secretsmanager_secret.resend_api_key.arn
}

output "log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.app.name
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = data.aws_lb_target_group.app.arn
}

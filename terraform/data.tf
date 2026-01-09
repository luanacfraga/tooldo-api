# ==========================================
# Data Sources - Reference existing AWS resources
# ==========================================

# ECS Cluster
data "aws_ecs_cluster" "main" {
  cluster_name = var.cluster_name
}

# IAM Role for ECS Task Execution
data "aws_iam_role" "ecs_execution_role" {
  name = var.execution_role_name
}

# ECR Repository
data "aws_ecr_repository" "app" {
  name = var.ecr_repository_name
}

# Target Group (by name)
data "aws_lb_target_group" "app" {
  name = "tooldo-api-tg"
}

# VPC
data "aws_vpc" "main" {
  id = var.vpc_id
}

# Subnets
data "aws_subnet" "private" {
  for_each = toset(var.private_subnet_ids)
  id       = each.value
}

# Security Group
data "aws_security_group" "app" {
  id = var.app_security_group_id
}

# Current AWS Region
data "aws_region" "current" {}

# Current AWS Account
data "aws_caller_identity" "current" {}

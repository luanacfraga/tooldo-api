# ==========================================
# CloudWatch Logs
# ==========================================

resource "aws_cloudwatch_log_group" "app" {
  name              = var.log_group_name
  retention_in_days = var.log_retention_days

  tags = {
    Name = "tooldo-api-logs"
  }
}

# ==========================================
# ECS Task Definition
# ==========================================

resource "aws_ecs_task_definition" "app" {
  family                   = var.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = data.aws_iam_role.ecs_execution_role.arn
  task_role_arn            = data.aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = var.container_name
      image     = "${data.aws_ecr_repository.app.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = tonumber(var.app_port)
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.node_env
        },
        {
          name  = "PORT"
          value = var.app_port
        },
        {
          name  = "ALLOWED_ORIGINS"
          value = var.allowed_origins
        },
        {
          name  = "FRONTEND_URL"
          value = var.frontend_url
        },
        {
          name  = "EMAIL_ASSETS_BASE_URL"
          value = var.frontend_url
        },
        {
          name  = "EMAIL_LOGO_URL"
          value = "${var.frontend_url}/_next/image?url=/images/logo.png&w=640&q=75"
        },
        {
          name  = "DB_HOST"
          value = var.db_host
        },
        {
          name  = "DB_PORT"
          value = var.db_port
        },
        {
          name  = "DB_NAME"
          value = var.db_name
        },
        {
          name  = "EMAIL_FROM"
          value = var.email_from
        },
        {
          name  = "EMAIL_FROM_NAME"
          value = var.email_from_name
        }
      ]

      secrets = [
        {
          name      = "DB_USER"
          valueFrom = "${data.aws_secretsmanager_secret.rds.arn}:username::"
        },
        {
          name      = "DB_PASS"
          valueFrom = "${data.aws_secretsmanager_secret.rds.arn}:password::"
        },
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.database_url.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_secretsmanager_secret.jwt_secret.arn
        },
        {
          name      = "RESEND_API_KEY"
          valueFrom = aws_secretsmanager_secret.resend_api_key.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = var.container_name
        }
      }

      healthCheck = {
        command = [
          "CMD-SHELL",
          "node -e \"require('http').get('http://localhost:${var.app_port}/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\""
        ]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 40
      }
    }
  ])

  tags = {
    Name = "tooldo-api-task"
  }
}

# ==========================================
# ECS Service
# ==========================================

resource "aws_ecs_service" "app" {
  name            = var.service_name
  cluster         = data.aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.app_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = data.aws_lb_target_group.app.arn
    container_name   = var.container_name
    container_port   = tonumber(var.app_port)
  }

  # Force new deployment when task definition changes
  force_new_deployment = true

  # Ignore desired_count changes from auto-scaling
  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [
    aws_ecs_task_definition.app
  ]

  tags = {
    Name = "tooldo-api-service"
  }
}

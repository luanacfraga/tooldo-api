# ==========================================
# AWS Secrets Manager
# ==========================================

# Database URL Secret
resource "aws_secretsmanager_secret" "database_url" {
  name        = "tooldo/db/url"
  description = "PostgreSQL connection string for Tooldo API"

  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${var.db_user}:${var.db_password}@${var.db_host}:${var.db_port}/${var.db_name}?schema=public"
}

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name        = "tooldo/jwt/secret"
  description = "JWT secret key for token signing"

  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}

# Resend API Key
resource "aws_secretsmanager_secret" "resend_api_key" {
  name        = "tooldo/resend/api-key"
  description = "Resend API key for email sending"

  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "resend_api_key" {
  secret_id     = aws_secretsmanager_secret.resend_api_key.id
  secret_string = var.resend_api_key
}

# Reference to existing RDS secret (auto-rotated by AWS)
data "aws_secretsmanager_secret" "rds" {
  name = "rds!db-88e2c3ab-7e5b-4a52-835b-83d97a389c6b"
}

data "aws_secretsmanager_secret_version" "rds" {
  secret_id = data.aws_secretsmanager_secret.rds.id
}

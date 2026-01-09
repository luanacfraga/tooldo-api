terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend local (padrão - state armazenado localmente)
  # Para produção, considere migrar para S3 backend
  # backend "s3" {
  #   bucket         = "tooldo-terraform-state"
  #   key            = "tooldo-api/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "tooldo-api"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}

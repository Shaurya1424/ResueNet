terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "networking" {
  source = "./modules/networking"

  vpc_cidr     = var.vpc_cidr
  project_name = var.project_name
  environment  = var.environment
}

module "security" {
  source = "./modules/security"

  vpc_id       = module.networking.vpc_id
  vpc_cidr     = var.vpc_cidr
  admin_cidr   = var.admin_cidr
  project_name = var.project_name
  environment  = var.environment
}

module "compute" {
  source = "./modules/compute"

  ubuntu_ami            = var.ubuntu_ami
  jenkins_instance_type = var.jenkins_instance_type
  app_instance_type     = var.app_instance_type
  key_pair_name         = var.key_pair_name
  public_subnet_id      = module.networking.public_subnet_ids[0]
  jenkins_sg_id         = module.security.jenkins_sg_id
  app_sg_id             = module.security.app_sg_id
  monitoring_sg_id      = module.security.monitoring_sg_id
  project_name          = var.project_name
  environment           = var.environment
}

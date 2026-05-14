variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "project_name" {
  description = "Project name for resource tags"
  type        = string
}

variable "environment" {
  description = "Environment name for resource tags"
  type        = string
}

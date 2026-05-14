variable "vpc_id" {
  description = "VPC ID where security groups will be created"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR range of the VPC"
  type        = string
}

variable "admin_cidr" {
  description = "Administrator IP range in CIDR notation"
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

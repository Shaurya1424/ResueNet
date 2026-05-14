variable "aws_region" {
  description = "AWS region where infrastructure will be provisioned"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the RescueNet VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "ubuntu_ami" {
  description = "Ubuntu 22.04 LTS"
  type        = string
  default     = "ami-0c55b159cbfafe1f0"
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for Jenkins server"
  type        = string
  default     = "t2.medium"
}

variable "app_instance_type" {
  description = "EC2 instance type for application server"
  type        = string
  default     = "t2.medium"
}

variable "key_pair_name" {
  description = "Existing AWS EC2 key pair name used for SSH access"
  type        = string
}

variable "admin_cidr" {
  description = "Your IP in CIDR format e.g. 203.0.113.5/32"
  type        = string
}

variable "project_name" {
  description = "Project name used in resource tagging"
  type        = string
  default     = "rescuenet"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "dev"
}

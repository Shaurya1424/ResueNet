variable "ubuntu_ami" {
  description = "AMI ID for Ubuntu 22.04 instances"
  type        = string
}

variable "jenkins_instance_type" {
  description = "EC2 instance type for Jenkins server"
  type        = string
}

variable "app_instance_type" {
  description = "EC2 instance type for application server"
  type        = string
}

variable "key_pair_name" {
  description = "EC2 key pair name for SSH access"
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet ID where compute instances will be launched"
  type        = string
}

variable "jenkins_sg_id" {
  description = "Security group ID for Jenkins server"
  type        = string
}

variable "app_sg_id" {
  description = "Security group ID for application server"
  type        = string
}

variable "monitoring_sg_id" {
  description = "Security group ID for monitoring server"
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

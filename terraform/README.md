# RescueNet Terraform Infrastructure

This Terraform setup provisions AWS infrastructure for RescueNet, including networking, security groups, and compute instances for CI/CD, application hosting, and monitoring.

## Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Terraform 1.5.0 or newer
- An existing AWS EC2 key pair for SSH access
- Sufficient AWS IAM permissions to create VPC, subnets, route tables, NAT gateway, security groups, EC2 instances, and Elastic IPs

## Configuration

1. Copy `terraform.tfvars.example` to `terraform.tfvars`.
2. Update all placeholder values, especially:
   - `key_pair_name`
   - `admin_cidr`
   - `ubuntu_ami` (if your region uses a different AMI ID)

## Initialize Terraform

```bash
cd terraform
terraform init
```

## Create an Execution Plan

```bash
terraform plan -var-file="terraform.tfvars"
```

## Apply Infrastructure

```bash
terraform apply -var-file="terraform.tfvars"
```

## Destroy Infrastructure

```bash
terraform destroy -var-file="terraform.tfvars"
```

## Outputs and URLs

After apply, Terraform prints useful outputs:

- `jenkins_url`: Jenkins UI endpoint on port 8080
- `app_server_ip`: Public IP of the RescueNet application server
- `monitoring_grafana_url`: Grafana endpoint on port 3001
- `monitoring_prometheus_url`: Prometheus endpoint on port 9090
- `ssh_jenkins`: SSH command template for Jenkins host
- `ssh_app`: SSH command template for application host

These outputs are designed to help you quickly access and validate the provisioned RescueNet infrastructure.

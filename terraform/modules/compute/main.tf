resource "aws_instance" "jenkins" {
  ami                         = var.ubuntu_ami
  instance_type               = var.jenkins_instance_type
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.jenkins_sg_id]
  key_name                    = var.key_pair_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = 30
    volume_type = "gp2"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -euxo pipefail

              apt-get update -y
              apt-get install -y ca-certificates curl gnupg lsb-release software-properties-common apt-transport-https
              apt-get install -y openjdk-17-jdk docker.io
              systemctl enable docker
              systemctl start docker

              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /etc/apt/keyrings/jenkins.asc > /dev/null
              chmod a+r /etc/apt/keyrings/jenkins.asc
              echo "deb [signed-by=/etc/apt/keyrings/jenkins.asc] https://pkg.jenkins.io/debian-stable binary/" > /etc/apt/sources.list.d/jenkins.list
              apt-get update -y
              apt-get install -y jenkins

              usermod -aG docker jenkins

              KUBECTL_VERSION="$(curl -L -s https://dl.k8s.io/release/stable.txt)"
              curl -LO "https://dl.k8s.io/release/$${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
              install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
              rm -f kubectl

              systemctl enable jenkins
              systemctl start jenkins
              EOF

  tags = {
    Name        = "rescuenet-jenkins"
    Role        = "cicd"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_eip" "jenkins" {
  instance = aws_instance.jenkins.id
  domain   = "vpc"

  tags = {
    Name        = "rescuenet-jenkins-eip"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_instance" "app" {
  ami                         = var.ubuntu_ami
  instance_type               = var.app_instance_type
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.app_sg_id]
  key_name                    = var.key_pair_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -euxo pipefail

              apt-get update -y
              apt-get install -y ca-certificates curl gnupg lsb-release software-properties-common
              apt-get install -y docker.io
              systemctl enable docker
              systemctl start docker

              KUBECTL_VERSION="$(curl -L -s https://dl.k8s.io/release/stable.txt)"
              curl -LO "https://dl.k8s.io/release/$${KUBECTL_VERSION}/bin/linux/amd64/kubectl"
              install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
              rm -f kubectl

              curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
              install minikube-linux-amd64 /usr/local/bin/minikube
              rm -f minikube-linux-amd64

              curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
              apt-get install -y nodejs
              EOF

  tags = {
    Name        = "rescuenet-app-server"
    Role        = "application"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name        = "rescuenet-app-eip"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_instance" "monitoring" {
  ami                         = var.ubuntu_ami
  instance_type               = "t2.small"
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.monitoring_sg_id]
  key_name                    = var.key_pair_name
  associate_public_ip_address = true

  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -euxo pipefail

              apt-get update -y
              apt-get install -y docker.io docker-compose-plugin
              systemctl enable docker
              systemctl start docker
              EOF

  tags = {
    Name        = "rescuenet-monitoring"
    Role        = "monitoring"
    Project     = var.project_name
    Environment = var.environment
  }
}

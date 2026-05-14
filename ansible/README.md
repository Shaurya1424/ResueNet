# RescueNet Ansible Configuration Management

This Ansible setup configures the Terraform-provisioned RescueNet EC2 servers and deploys platform components across Jenkins, application/Kubernetes, SonarQube, and monitoring nodes.

## Prerequisites

- Ansible installed on your control machine (Ansible Core 2.14+ recommended)
- AWS key pair private key available locally (same key used in Terraform)
- Infrastructure already provisioned by Terraform (Jenkins, App server, Monitoring server)
- SSH access to all three instances from your machine

## Setup

1. Update inventory hosts:
   - Open `inventory.ini`
   - Replace `JENKINS_PUBLIC_IP`, `APP_SERVER_PUBLIC_IP`, and `MONITORING_PUBLIC_IP` using Terraform outputs
2. Ensure Ansible SSH key path is correct in `ansible.cfg`:
   - `private_key_file = ~/.ssh/your-key.pem`
3. Export required environment variables before running playbooks:

```bash
export DOCKERHUB_USERNAME="your-dockerhub-username"
export JWT_SECRET="your-strong-jwt-secret"
export GRAFANA_PASSWORD="your-grafana-admin-password"
```

## Run Full Playbook

From inside the `ansible` directory:

```bash
ansible-playbook site.yml
```

## Run a Single Role/Play by Tag

Each play in `site.yml` has tags. Example for Jenkins:

```bash
ansible-playbook site.yml --tags jenkins
```

Other useful tags:
- `common`
- `docker`
- `sonarqube`
- `kubernetes`
- `rescuenet-deploy`
- `monitoring`

## Dry Run (Check Mode)

Preview changes without applying:

```bash
ansible-playbook site.yml --check
```

## Troubleshooting

- Jenkins cannot talk to Docker:
  - Re-run Jenkins role: `ansible-playbook site.yml --tags jenkins`
  - If needed on Jenkins host: `sudo usermod -aG docker jenkins && sudo systemctl restart jenkins`
- SonarQube does not start:
  - Verify kernel setting: `sysctl vm.max_map_count`
  - Required value is `262144`; if not set, re-run `sonarqube` tag
- Minikube startup fails:
  - Ensure app server has at least 2 vCPUs and 4GB RAM
  - Check Docker daemon status and rerun `kubernetes` tag

## Post-Deployment Checklist

1. Open Jenkins:
   - `http://<jenkins_public_ip>:8080`
2. Open SonarQube:
   - `http://<monitoring_public_ip>:9000`
3. Open Prometheus:
   - `http://<monitoring_public_ip>:9090`
4. Open Grafana:
   - `http://<monitoring_public_ip>:3001`
5. Get Jenkins initial admin password:
   - It is printed during Ansible run
   - Or manually on Jenkins host:
     - `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`
6. Configure Jenkins pipeline:
   - Create a pipeline job in Jenkins
   - Point SCM to your RescueNet GitHub repository URL
   - Configure credentials (`dockerhub-credentials` and any GitHub credentials)
   - Set SonarQube server URL to `http://<monitoring_public_ip>:9000`
   - Run pipeline and verify lint/test/build/scan/deploy stages

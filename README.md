# RescueNet - Disaster Relief Resource Management System

RescueNet is a full-stack MERN platform for coordinating disaster operations across admins, volunteers, and relief centers. It supports disaster tracking, volunteer assignment, resource management, analytics, notifications, observability, Dockerized deployment, and Kubernetes manifests for cloud-native rollout.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Run Locally (Without Docker)](#run-locally-without-docker)
- [Run with Docker Compose](#run-with-docker-compose)
- [Run on Minikube (Kubernetes)](#run-on-minikube-kubernetes)
- [Infrastructure Provisioning (Terraform)](#infrastructure-provisioning-terraform)
- [Configuration Management (Ansible)](#configuration-management-ansible)
- [Seed / Demo Data](#seed--demo-data)
- [Monitoring](#monitoring)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Core API Endpoints](#core-api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

---

## Features

### Platform capabilities
- JWT authentication with role-based access (`admin`, `volunteer`, `relief_center`)
- Disaster lifecycle management with controlled status transitions
- Resource inventory tracking and dispatch workflow
- Volunteer availability, profile updates, assignment, and skill matching
- Relief center registration, occupancy tracking, and resource requests
- Audit logging for key mutations
- Notification system for operational alerts

### Frontend experience
- Role-based dashboards
- Admin command center with maps, charts, and activity feed
- Volunteer dashboard and profile management
- Relief center dashboard with stats, requests, and notifications
- Shared reusable UI component library

### DevOps/operations
- Multi-stage Dockerfiles for backend and frontend
- Nginx static serving + API proxying
- Docker Compose stack with MongoDB, Prometheus, and Grafana
- Kubernetes manifests for namespace, workloads, ingress, autoscaling
- Jenkins pipeline for lint/test/build/scan/deploy
- Terraform modules for AWS networking, security groups, and compute
- Ansible roles for host configuration, CI tooling, Kubernetes bootstrap, and deployment

---

## Architecture

- **Frontend**: React app served by Nginx
- **Backend**: Node.js + Express REST API
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT bearer tokens
- **Observability**: Prometheus metrics endpoint (`/api/metrics`) + Grafana dashboards

High-level flow:
1. User logs in and receives JWT.
2. Frontend sends JWT in `Authorization: Bearer <token>`.
3. Backend authorizes routes by role and processes domain actions.
4. Metrics, logs, and audit records capture runtime behavior.

---

## Tech Stack

- **Frontend**: React 18, React Router, Axios, Recharts, React Leaflet, React Hot Toast
- **Backend**: Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, express-validator
- **Observability**: prom-client, Prometheus, Grafana, morgan, winston
- **Testing**: Jest, Supertest, mongodb-memory-server
- **DevOps**: Docker, Docker Compose, Kubernetes, Jenkins, Terraform, Ansible

---

## Project Structure

```text
rescue-net/
  backend/
    app.js
    server.js
    config/
    controllers/
    middleware/
    metrics.js
    models/
    routes/
    tests/
  frontend/
    src/
    public/
    nginx.conf
  monitoring/
    prometheus.yml
    grafana/
  k8s/
    namespace.yaml
    configmap.yaml
    secret.yaml
    mongodb.yaml
    backend.yaml
    frontend.yaml
    ingress.yaml
  terraform/
    main.tf
    variables.tf
    outputs.tf
    modules/
  ansible/
    site.yml
    inventory.ini
    group_vars/
    roles/
  docker-compose.yml
  Jenkinsfile
```

---

## Prerequisites

### For local dev
- Node.js 18+
- npm 9+
- MongoDB 7+ (local or remote)

### For container workflow
- Docker Desktop + Docker Compose plugin

### For Kubernetes workflow
- Minikube
- kubectl

### For infrastructure provisioning
- Terraform 1.5+
- AWS CLI configured with credentials and region

### For configuration management
- Ansible (Core 2.14+ recommended)
- SSH private key for the EC2 key pair used in Terraform

---

## Environment Variables

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/disasterDB
JWT_SECRET=replace-me-with-a-long-random-string
LOG_LEVEL=info
```

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

> For Kubernetes frontend builds, use `REACT_APP_API_URL=/api` so Nginx can proxy internally to backend service.

---

## Run Locally (Without Docker)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend starts on `http://localhost:5001`.

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend starts on `http://localhost:3000`.

---

## Run with Docker Compose

From project root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5002` (host port 5002 avoids clashing with local dev on 5001)
- MongoDB: `localhost:27017`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

Default Grafana credentials:
- user: `admin`
- password: `admin`

Stop stack:

```bash
docker compose down
```

---

## Run on Minikube (Kubernetes)

### 1) Start cluster

```bash
minikube start
```

### 2) Build images inside Minikube Docker daemon

```bash
eval $(minikube docker-env)
docker build -t rescuenet-backend:latest ./backend
docker build --build-arg REACT_APP_API_URL=/api -t rescuenet-frontend:latest ./frontend
```

### 3) Apply manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4) Check rollout

```bash
kubectl get pods -n rescuenet
kubectl rollout status deployment/rescuenet-backend -n rescuenet
kubectl rollout status deployment/rescuenet-frontend -n rescuenet
```

### 5) Open frontend

```bash
minikube service rescuenet-frontend -n rescuenet --url
```

Keep this terminal open while accessing the URL.

---

## Infrastructure Provisioning (Terraform)

Terraform code lives in `terraform/` and provisions RescueNet AWS infrastructure:
- VPC, public/private subnets, internet + NAT routing
- Security groups for Jenkins, app nodes, MongoDB, and monitoring
- EC2 instances for Jenkins, app/kubernetes node, and monitoring
- Elastic IPs for stable Jenkins and app access

### 1) Prepare variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Update at minimum:
- `key_pair_name`
- `admin_cidr` (must be CIDR, e.g. `203.0.113.5/32`)

### 2) Initialize and validate

```bash
terraform init
terraform validate
```

### 3) Plan and apply

```bash
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

### 4) Destroy when done

```bash
terraform destroy -var-file="terraform.tfvars"
```

---

## Configuration Management (Ansible)

Ansible code lives in `ansible/` and configures the Terraform-created servers:
- `common` + `docker` baseline on all hosts
- Jenkins and plugin setup on the Jenkins node
- SonarQube on monitoring node
- Kubernetes tooling + Minikube on app node
- RescueNet K8s deployment on app node
- Prometheus/Grafana stack and datasource wiring on monitoring node

### 1) Populate inventory

Edit `ansible/inventory.ini` with Terraform output IPs for:
- `JENKINS_PUBLIC_IP`
- `APP_SERVER_PUBLIC_IP`
- `MONITORING_PUBLIC_IP`

### 2) Export required secrets/env vars

```bash
export DOCKERHUB_USERNAME="your-dockerhub-user"
export JWT_SECRET="your-jwt-secret"
export GRAFANA_PASSWORD="your-grafana-password"
```

### 3) Run playbook

```bash
cd ansible
ansible-playbook site.yml
```

Useful alternatives:

```bash
ansible-playbook site.yml --check
ansible-playbook site.yml --tags jenkins
ansible-playbook site.yml --tags monitoring
```

For full Ansible details, see `ansible/README.md`.

---

## Seed / Demo Data

A seeded admin and demo operational data were added during setup.

### Seeded admin credentials
- Email: `admin.seed@rescuenet.io`
- Password: `secret123`

### Current seeded entities
- Volunteers: 5
- Relief centers: 3
- Disasters: 3
- Resources: 12

If needed, reseed using API scripts or custom seed logic.

---

## Monitoring

### Prometheus
- Scrapes backend metrics from `/api/metrics`
- Config: `monitoring/prometheus.yml`

### Grafana
- Datasource provisioning: `monitoring/grafana/provisioning/datasources/`
- Dashboard provisioning: `monitoring/grafana/provisioning/dashboards/`
- Preloaded dashboard: `monitoring/grafana/dashboards/rescuenet-overview.json`

---

## Testing

From `backend/`:

```bash
npm test
```

Useful variants:

```bash
npm run test:watch
npm run test:coverage
```

What is covered:
- Auth registration/login flows
- Disaster CRUD/status transition validations
- Health/readiness/metrics endpoints

---

## CI/CD

Pipeline file: `Jenkinsfile`

Stages include:
- Checkout
- Install & lint (frontend/backend)
- Backend tests + frontend build
- Docker image build
- Trivy scan
- Optional push on `main`
- Optional Kubernetes deploy + rollout checks

Typical infra-to-delivery flow:
1. Provision base infrastructure with Terraform (`terraform/`)
2. Configure hosts and runtime dependencies with Ansible (`ansible/`)
3. Run Jenkins pipeline for application CI/CD

---

## Core API Endpoints

### Health
- `GET /api/health`
- `GET /api/ready`
- `GET /api/metrics`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Disasters
- `GET /api/disasters`
- `POST /api/disasters`
- `PATCH /api/disasters/:id/status`
- `GET /api/disasters/stats`

### Resources
- `GET /api/resources`
- `POST /api/resources`
- `PATCH /api/resources/:id/dispatch`
- `GET /api/resources/summary`

### Volunteers
- `GET /api/volunteers`
- `GET /api/volunteers/available`
- `POST /api/volunteers/match`
- `GET /api/volunteers/me`
- `PATCH /api/volunteers/me`

### Relief Centers
- `GET /api/centers`
- `GET /api/centers/me`
- `POST /api/centers`
- `PATCH /api/centers/me`
- `POST /api/centers/request`

### Additional
- `GET /api/analytics/overview`
- `GET /api/analytics/disaster/:id`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

---

## Troubleshooting

### 1) `ImagePullBackOff` in Minikube
Cause: Deployment references images not available in Minikube daemon.

Fix:
```bash
eval $(minikube docker-env)
docker build -t rescuenet-backend:latest ./backend
docker build --build-arg REACT_APP_API_URL=/api -t rescuenet-frontend:latest ./frontend
kubectl rollout restart deployment/rescuenet-backend -n rescuenet
kubectl rollout restart deployment/rescuenet-frontend -n rescuenet
```

### 2) Frontend opens but login/register fails in K8s
Cause: frontend built with wrong API base URL.

Fix: rebuild frontend with `--build-arg REACT_APP_API_URL=/api` and restart deployment.

### 3) `ERR_CONNECTION_RESET` on Minikube service URL
Cause: Service tunnel terminal closed or app pod crashing.

Fix:
- Keep `minikube service ... --url` terminal running.
- Check pod status/logs:
```bash
kubectl get pods -n rescuenet
kubectl logs -n rescuenet <frontend-pod-name>
```

### 4) Port conflicts locally
Local dev uses backend port `5001` (see `backend/.env`). Docker Compose maps the API to host port **`5002`** by default so both can run together. Set `BACKEND_HOST_PORT` in a `.env` next to `docker-compose.yml` if you need a different host port.

### 5) Clear stale auth in browser
```js
localStorage.clear()
```

---

## Security Notes

- Never commit real `.env` files.
- Replace placeholder secrets for production.
- Use secret managers for CI/CD and cluster secrets.
- Restrict admin account creation in production (currently open registration supports admin role).
- Add rate limiting and brute-force protections for auth endpoints before production rollout.

---

If you want, this README can be extended with:
- API request/response examples per endpoint
- architecture diagrams
- contributor/developer workflow
- release/versioning policy

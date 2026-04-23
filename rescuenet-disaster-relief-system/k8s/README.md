# RescueNet Kubernetes Manifests

Apply order matters; use the commands below for a clean bring-up.

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml        # replace JWT_SECRET with a real value first
kubectl apply -f mongodb.yaml
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
kubectl apply -f ingress.yaml
```

Or apply all at once (order is resolved by Kubernetes for most resources):

```bash
kubectl apply -f .
```

## Local access (minikube / kind)

```bash
# Add a hosts entry:
echo "$(minikube ip) rescuenet.local" | sudo tee -a /etc/hosts
# Or port-forward the frontend service:
kubectl port-forward -n rescuenet svc/rescuenet-frontend 3000:80
kubectl port-forward -n rescuenet svc/rescuenet-backend  5001:5000
```

## Creating a real secret

```bash
kubectl -n rescuenet create secret generic rescuenet-secret \
  --from-literal=JWT_SECRET='change-me-please' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Resources at a glance

| File            | Resources                                              |
| --------------- | ------------------------------------------------------ |
| namespace.yaml  | `Namespace rescuenet`                                  |
| configmap.yaml  | Non-secret runtime config                              |
| secret.yaml     | `JWT_SECRET`                                           |
| mongodb.yaml    | PVC + StatefulSet + headless Service                   |
| backend.yaml    | Deployment + Service + HorizontalPodAutoscaler         |
| frontend.yaml   | Deployment + Service                                   |
| ingress.yaml    | Ingress routing `/` -> frontend, `/api` -> backend     |

output "jenkins_url" {
  description = "Jenkins web URL"
  value       = "http://${module.compute.jenkins_public_ip}:8080"
}

output "app_server_ip" {
  description = "Public IP of RescueNet application server"
  value       = module.compute.app_server_public_ip
}

output "monitoring_grafana_url" {
  description = "Grafana URL hosted on monitoring server"
  value       = "http://${module.compute.monitoring_public_ip}:3001"
}

output "monitoring_prometheus_url" {
  description = "Prometheus URL hosted on monitoring server"
  value       = "http://${module.compute.monitoring_public_ip}:9090"
}

output "ssh_jenkins" {
  description = "SSH command for Jenkins server"
  value       = "ssh -i <your-key>.pem ubuntu@${module.compute.jenkins_public_ip}"
}

output "ssh_app" {
  description = "SSH command for application server"
  value       = "ssh -i <your-key>.pem ubuntu@${module.compute.app_server_public_ip}"
}

output "jenkins_public_ip" {
  description = "Elastic public IP attached to Jenkins server"
  value       = aws_eip.jenkins.public_ip
}

output "app_server_public_ip" {
  description = "Elastic public IP attached to application server"
  value       = aws_eip.app.public_ip
}

output "monitoring_public_ip" {
  description = "Public IP of monitoring server"
  value       = aws_instance.monitoring.public_ip
}

output "jenkins_instance_id" {
  description = "Instance ID of Jenkins server"
  value       = aws_instance.jenkins.id
}

output "app_instance_id" {
  description = "Instance ID of application server"
  value       = aws_instance.app.id
}

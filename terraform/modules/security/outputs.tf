output "jenkins_sg_id" {
  description = "Security group ID for Jenkins server"
  value       = aws_security_group.jenkins.id
}

output "app_sg_id" {
  description = "Security group ID for application servers"
  value       = aws_security_group.app.id
}

output "mongo_sg_id" {
  description = "Security group ID for MongoDB"
  value       = aws_security_group.mongo.id
}

output "monitoring_sg_id" {
  description = "Security group ID for monitoring server"
  value       = aws_security_group.monitoring.id
}

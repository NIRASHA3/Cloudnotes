output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.cloudnotes_server.id
}

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_eip.cloudnotes_eip.public_ip
}

output "public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_eip.cloudnotes_eip.public_dns
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i keys/cloudnotes-key.pem ubuntu@${aws_eip.cloudnotes_eip.public_ip}"
}

output "application_urls" {
  description = "URLs to access the application"
  value = {
    frontend = "http://${aws_eip.cloudnotes_eip.public_ip}:5173"
    backend  = "http://${aws_eip.cloudnotes_eip.public_ip}:5000"
    ssh      = "ssh -i keys/cloudnotes-key.pem ubuntu@${aws_eip.cloudnotes_eip.public_ip}"
  }
}
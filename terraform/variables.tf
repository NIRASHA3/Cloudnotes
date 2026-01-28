variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "root_volume_size" {
  description = "Root volume size in GB"
  type        = number
  default     = 20
}

# Sensitive variables (set via environment or tfvars)
variable "aws_access_key" {
  description = "AWS access key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "aws_secret_key" {
  description = "AWS secret key"
  type        = string
  sensitive   = true
  default     = ""
}
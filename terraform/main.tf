terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  # For production, use environment variables or AWS profiles
  # access_key = var.aws_access_key
  # secret_key = var.aws_secret_key
}

# Generate SSH key pair
resource "tls_private_key" "cloudnotes_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Save private key locally (for Ansible)
resource "local_file" "private_key" {
  content         = tls_private_key.cloudnotes_key.private_key_pem
  filename        = "${path.module}/keys/cloudnotes-key.pem"
  file_permission = "0600"
}

# Save public key locally (optional)
resource "local_file" "public_key" {
  content         = tls_private_key.cloudnotes_key.public_key_openssh
  filename        = "${path.module}/keys/cloudnotes-key.pub"
  file_permission = "0644"
}

# Create a key pair for SSH access
resource "aws_key_pair" "cloudnotes_key" {
  key_name   = "cloudnotes-key-${var.environment}"
  public_key = tls_private_key.cloudnotes_key.public_key_openssh
  
  tags = {
    Project     = "CloudNotes"
    Environment = var.environment
  }
}

# Create security group
resource "aws_security_group" "cloudnotes_sg" {
  name        = "cloudnotes-sg-${var.environment}"
  description = "Security group for CloudNotes application"
  vpc_id      = data.aws_vpc.default.id

  # SSH access from anywhere 
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access for frontend
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API port
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend dev server port
  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "cloudnotes-sg"
    Project     = "CloudNotes"
    Environment = var.environment
  }
}

# Get latest Ubuntu AMI
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

# Get default VPC
data "aws_vpc" "default" {
  default = true
}

# Create EC2 instance
resource "aws_instance" "cloudnotes_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  key_name = aws_key_pair.cloudnotes_key.key_name

  vpc_security_group_ids = [aws_security_group.cloudnotes_sg.id]

  # Root disk
  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
    encrypted   = true
  }

  # User data script to install Docker on boot
  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose
              usermod -aG docker ubuntu
              systemctl enable docker
              systemctl start docker
              EOF

  tags = {
    Name        = "cloudnotes-server-${var.environment}"
    Project     = "CloudNotes"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  # Ensure instance is reachable via SSH
  provisioner "remote-exec" {
    inline = ["echo 'Instance is ready for Ansible configuration'"]

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = tls_private_key.cloudnotes_key.private_key_pem
      host        = self.public_ip
    }
  }
}

# Elastic IP for static public IP
resource "aws_eip" "cloudnotes_eip" {
  instance = aws_instance.cloudnotes_server.id
  domain   = "vpc"

  tags = {
    Name        = "cloudnotes-eip-${var.environment}"
    Project     = "CloudNotes"
    Environment = var.environment
  }
}
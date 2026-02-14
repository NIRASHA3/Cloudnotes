# Complete CI/CD Pipeline Setup Guide

## Overview
- **CI**: Build, test, scan, and push Docker images
- **CD**: Deploy to AWS EC2 using Terraform and Ansible

## Pipeline Stages

### CI Stages (Always Run)
1. **Clone Repository** - Get latest code from GitHub
2. **Set Build Metadata** - Create versioned image tags
3. **Install Dependencies** - Install npm packages for backend/frontend
4. **Run Tests and Lint** - Execute tests and linting
5. **Code Quality Scan** - Optional SonarQube analysis
6. **Build Docker Images** - Build versioned Docker images
7. **Security Scan** - Optional Trivy vulnerability scanning
8. **Push Docker Images** - Push to Docker Hub

### CD Stages
9. **Terraform Init/Plan/Apply** - Optional infrastructure provisioning
10. **Get Server IP** - Retrieve EC2 instance IP
11. **Configure Ansible Inventory** - Set up deployment target
12. **Deploy to EC2 with Ansible** - Deploy containers to EC2
13. **Verify Deployment** - Health checks

## Pipeline Parameters

### RUN_TERRAFORM (default: false)
- Set to `true` only for:
  - First deployment
  - Infrastructure changes
  - EC2 instance recreation
- Leave as `false` for code-only deployments (saves time)

### RUN_SONARQUBE (default: false)
- Requires SonarQube server configured in Jenkins
- Enable for code quality analysis

### RUN_TRIVY (default: true)
- Scans Docker images for vulnerabilities
- Recommended to keep enabled

## How to Use

### First Time Setup

1. **Create Jenkins Job**
   - New Item → Pipeline
   - Name: `cloudnotes-complete-cicd`
   - Build Triggers: ✅ GitHub hook trigger for GITScm polling
   - Pipeline → SCM: Git
   - Repository: `https://github.com/NIRASHA3/Cloudnotes.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile-complete`

2. **First Build (with Infrastructure)**
   - Click "Build with Parameters"
   - Set `RUN_TERRAFORM` = `true`
   - Set `RUN_TRIVY` = `true`
   - Click "Build"
   - Wait ~10-15 minutes for complete provisioning

### Subsequent Deployments (Code Updates)

**Automatic (via Webhook):**
- Push code to GitHub `main` branch
- Pipeline auto-triggers
- Terraform skipped (infrastructure exists)
- Only builds, tests, and deploys new code
- Completes in ~5-8 minutes

**Manual:**
- Click "Build with Parameters"
- Leave `RUN_TERRAFORM` = `false`
- Click "Build"

### When to Run Terraform

Run with `RUN_TERRAFORM=true` when:
- ❌ First deployment
- ❌ Changed `terraform/*.tf` files
- ❌ Changed security groups, instance type
- ❌ Recreating EC2 instance

Skip Terraform (`RUN_TERRAFORM=false`) when:
- ✅ Code changes only
- ✅ Frontend/backend updates
- ✅ Configuration changes
- ✅ Bug fixes

## Deployment Flow

### Code-Only Update (Typical)
```
Push to GitHub
  ↓ (webhook trigger)
Jenkins gets code
  ↓
Install dependencies
  ↓
Run tests/lint
  ↓
Build Docker images
  ↓
Scan with Trivy
  ↓
Push to Docker Hub
  ↓
Deploy to EC2 (13.51.227.34)
  ↓
Health checks
  ↓
Done (~5-8 min)
```

### Full Infrastructure Update
```
Manual trigger (RUN_TERRAFORM=true)
  ↓
CI stages (build, test, scan, push)
  ↓
Terraform provisions EC2
  ↓
Ansible configures server
  ↓
Deploy containers
  ↓
Done (~12-15 min)
```

## Required Jenkins Credentials

| Credential ID | Type | Description |
|---------------|------|-------------|
| `dockerhub-credentials` | Username/Password | Docker Hub login |
| `AWS_ACCESS_KEY_ID` | Secret text | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Secret text | AWS secret key |
| `MONGO_URI` | Secret text | MongoDB connection string |
| `JWT_SECRET` | Secret text | JWT signing secret |
| `GOOGLE_CLIENT_ID` | Secret text | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Secret text | Google OAuth secret |
| `EMAIL_PASS` | Secret text | Email password |

## GitHub Webhook Setup

1. GitHub repo → Settings → Webhooks → Add webhook
2. Payload URL: `https://<your-ngrok-url>/github-webhook/`
3. Content type: `application/json`
4. Events: "Just the push event"
5. Active: ✅

## Monitoring

### View Application
- Frontend: http://13.51.227.34:5173
- Backend: http://13.51.227.34:5000

### SSH to Server
```bash
ssh -i terraform/keys/cloudnotes-key.pem ubuntu@13.51.227.34
```

### View Container Logs
```bash
ssh ubuntu@13.51.227.34 "docker logs -f cloudnotes-backend"
ssh ubuntu@13.51.227.34 "docker logs -f cloudnotes-frontend"
```

### Check Container Status
```bash
ssh ubuntu@13.51.227.34 "docker ps"
```

## Troubleshooting

### Build Fails at "Push Docker Images"
- Check `dockerhub-credentials` in Jenkins
- Verify Docker Hub token is valid

### Terraform Stages Fail
- Ensure AWS credentials are correct
- Check AWS service limits
- Verify `terraform/keys/cloudnotes-key.pem` exists

### Ansible Deployment Fails
- Check SSH key permissions
- Verify EC2 security groups allow SSH (port 22)
- Ensure EC2 instance is running

### Webhook Not Triggering
- Verify ngrok is running: `ngrok http 8080`
- Check GitHub webhook deliveries for errors
- Ensure Jenkins job has "GitHub hook trigger" enabled

## Best Practices

1. **Regular Deployments**: Push small, frequent changes
2. **Use Webhook**: Let automation handle deployments
3. **Skip Terraform**: Only run when infrastructure changes
4. **Monitor Builds**: Check Jenkins logs for issues
5. **Test Locally**: Verify changes before pushing
6. **Version Tags**: Images are tagged with build number + git SHA

## What's Different between used Jenkinsfiles

| Feature | `Jenkinsfile` | `Jenkinsfile.terraform-ansible` | `Jenkinsfile-complete` |
|---------|---------------|--------------------------------|------------------------|
| Build images | ❌ | ❌ | ✅ |
| Run tests | ❌ | ❌ | ✅ |
| Security scan | ❌ | ❌ | ✅ |
| Push to Docker Hub | ❌ | ❌ | ✅ |
| Terraform | ❌ | ✅ | ✅ (optional) |
| Ansible deployment | ❌ | ✅ | ✅ |
| Auto-trigger | ❌ | ❌ | ✅ |
| Deploy to | localhost | EC2 | EC2 |

## Summary
- ✅ Builds and tests code
- ✅ Scans for vulnerabilities
- ✅ Pushes to Docker Hub
- ✅ Optionally provisions infrastructure
- ✅ Deploys to EC2
- ✅ Auto-triggers on git push
- ✅ No conflicts with existing infrastructure

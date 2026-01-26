pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE_BACKEND = 'nirashadeshani/cloudnotes:backend'
        DOCKER_IMAGE_FRONTEND = 'nirashadeshani/cloudnotes:frontend'
        BACKEND_CONTAINER = 'cloudnotes-backend-prod'
        FRONTEND_CONTAINER = 'cloudnotes-frontend-prod'
        BACKEND_PORT = '5000'
        FRONTEND_PORT = '5173'
    }
    
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/NIRASHA3/Cloudnotes.git'
            }
        }
        
        stage('Create Production Environment') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
                    string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_CLIENT_SECRET'),
                    string(credentialsId: 'EMAIL_PASS', variable: 'EMAIL_PASS')
                ]) {
                    sh """
                        echo "Creating production environment..."
                        
                        # Create environment file
                        cat > cloudnotes-backend.env << EOF
PORT=${BACKEND_PORT}
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
BACKEND_URL=http://localhost:${BACKEND_PORT}
FRONTEND_URL=http://localhost:${FRONTEND_PORT}
EMAIL_USER=nirashadeshani3@gmail.com
EMAIL_PASS=${EMAIL_PASS}
EMAIL_FROM=CloudNotes <noreply@cloudnotes.com>
NODE_ENV=production
EOF
                        
                        echo "Environment file created (sensitive values masked):"
                        cat cloudnotes-backend.env | sed 's/.*PASS=.*/EMAIL_PASS=********/g' | sed 's/.*SECRET=.*/JWT_SECRET=********/g'
                    """
                }
            }
        }
        
        stage('Cleanup Existing Containers') {
            steps {
                sh """
                    echo "Cleaning up existing containers..."
                    
                    # Stop and remove current containers
                    docker stop ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER} 2>/dev/null || true
                    docker rm ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER} 2>/dev/null || true
                    
                    # Clean up any other cloudnotes containers
                    docker ps -a --filter "name=cloudnotes" --format "{{.Names}}" | xargs -r docker stop 2>/dev/null || true
                    docker ps -a --filter "name=cloudnotes" --format "{{.Names}}" | xargs -r docker rm 2>/dev/null || true
                    
                    echo "Cleanup completed"
                """
            }
        }
        
        stage('Pull Docker Images') {
            steps {
                sh """
                    echo "Pulling Docker images..."
                    docker pull ${DOCKER_IMAGE_BACKEND}
                    docker pull ${DOCKER_IMAGE_FRONTEND}
                    echo "Images pulled successfully"
                """
            }
        }
        
        stage('Deploy Backend') {
            steps {
                sh """
                    echo "Deploying backend..."
                    docker run -d \\
                      --name ${BACKEND_CONTAINER} \\
                      -p ${BACKEND_PORT}:${BACKEND_PORT} \\
                      --env-file cloudnotes-backend.env \\
                      ${DOCKER_IMAGE_BACKEND}
                    
                    echo "Backend container started"
                    
                    # Wait for initialization
                    sleep 15
                    
                    echo "Backend logs:"
                    docker logs ${BACKEND_CONTAINER} --tail=10
                """
            }
        }
        
        stage('Verify Backend') {
            steps {
                sh """
                    echo "Verifying backend..."
                    
                    # Check if backend is responsive
                    for i in {1..6}; do
                        if curl -s -f http://localhost:\${BACKEND_PORT} > /dev/null; then
                            echo "Backend is responding"
                            break
                        fi
                        echo "Waiting for backend... (\$i/6)"
                        sleep 5
                    done
                    
                    # Test response
                    BACKEND_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:\${BACKEND_PORT} || echo "000")
                    
                    if [ "\$BACKEND_STATUS" = "000" ]; then
                        echo "ERROR: Backend not responding"
                        docker logs ${BACKEND_CONTAINER}
                        exit 1
                    else
                        echo "Backend HTTP Status: \$BACKEND_STATUS"
                    fi
                """
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                sh """
                    echo "Deploying frontend..."
                    docker run -d \\
                      --name ${FRONTEND_CONTAINER} \\
                      -p ${FRONTEND_PORT}:${FRONTEND_PORT} \\
                      -e VITE_BACKEND_URL=http://localhost:${BACKEND_PORT} \\
                      ${DOCKER_IMAGE_FRONTEND}
                    
                    echo "Frontend container started"
                    
                    sleep 10
                    
                    echo "Frontend logs:"
                    docker logs ${FRONTEND_CONTAINER} --tail=5 2>/dev/null || echo "Logs not available yet"
                """
            }
        }
        
        stage('Verify Frontend') {
            steps {
                sh """
                    echo "Verifying frontend..."
                    
                    FRONTEND_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:\${FRONTEND_PORT} || echo "000")
                    
                    if [ "\$FRONTEND_STATUS" = "200" ]; then
                        echo "Frontend is serving (HTTP 200)"
                    else
                        echo "Frontend HTTP Status: \$FRONTEND_STATUS"
                    fi
                """
            }
        }
    }
    
    post {
        always {
            sh """
                echo "========================================"
                echo "DEPLOYMENT SUMMARY"
                echo "========================================"
                
                echo ""
                echo "CONTAINER STATUS:"
                docker ps --filter "name=cloudnotes" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                
                echo ""
                echo "APPLICATION URLs:"
                echo "Frontend: http://localhost:${FRONTEND_PORT}"
                echo "Backend:  http://localhost:${BACKEND_PORT}"
                echo "Google OAuth: http://localhost:${BACKEND_PORT}/api/auth/google"
                
                echo ""
                echo "MANAGEMENT COMMANDS:"
                echo "  View logs:    docker logs -f ${BACKEND_CONTAINER}"
                echo "  Stop:         docker stop ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER}"
                echo "  Remove:       docker rm ${BACKEND_CONTAINER} ${FRONTEND_CONTAINER}"
            """
        }
        
        success {
            echo "Deployment completed successfully!"
        }
        
        failure {
            echo "Deployment failed!"
        }
    }
}
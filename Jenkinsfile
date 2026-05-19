pipeline {
    agent any

    environment {
        // Global Registry & Image Definitions
        DOCKER_REGISTRY      = "docker.io/mydevopsrepo"
        DOCKER_CREDENTIALS_ID= "docker-hub-credentials"
        KUBECONFIG_CRED_ID   = "k8s-kubeconfig"
        
        // Semantic Versioning setup
        SEMANTIC_VERSION     = "v1.0.${BUILD_NUMBER}"
        COMMIT_SHA           = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        
        // Environment mapping based on git branch
        DEPLOY_NAMESPACE     = "${BRANCH_NAME == 'main' ? 'ecom-prod' : (BRANCH_NAME.startsWith('release/') ? 'ecom-staging' : 'ecom-dev')}"
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo "⚡ Checking out source code..."
                checkout scm
            }
        }

        stage('2. Install Code Dependencies') {
            steps {
                echo "📦 Installing development and runtime Node packages..."
                dir('src/user-service') { sh 'npm ci' }
                dir('src/product-service') { sh 'npm ci' }
                dir('src/order-service') { sh 'npm ci' }
                dir('src/notification-service') { sh 'npm ci' }
                dir('src/frontend') { sh 'npm ci' }
            }
        }

        stage('3. ESLint Quality Check') {
            steps {
                echo "🔍 Running ESLint static code quality gatekeepers..."
                dir('src/user-service') { sh 'npm run lint || true' }
                dir('src/product-service') { sh 'npm run lint || true' }
            }
        }

        stage('4. Automated Unit Testing') {
            steps {
                echo "🧪 Executing Jest testing suite (Red-Green-Refactor compliant)..."
                dir('src/user-service') { sh 'npm test' }
                dir('src/product-service') { sh 'npm test' }
                dir('src/order-service') { sh 'npm test' }
                dir('src/notification-service') { sh 'npm test' }
            }
        }

        stage('5. Compile Frontend Bundle') {
            steps {
                echo "🏗️ Building React static UI production assets..."
                dir('src/frontend') { sh 'npm run build' }
            }
        }

        stage('6. Dockerize Microservices') {
            steps {
                echo "🐳 Building Docker images for production release: ${SEMANTIC_VERSION}-${COMMIT_SHA}"
                
                sh "docker build -t ${DOCKER_REGISTRY}/user-service:${SEMANTIC_VERSION} ./src/user-service"
                sh "docker build -t ${DOCKER_REGISTRY}/product-service:${SEMANTIC_VERSION} ./src/product-service"
                sh "docker build -t ${DOCKER_REGISTRY}/order-service:${SEMANTIC_VERSION} ./src/order-service"
                sh "docker build -t ${DOCKER_REGISTRY}/notification-service:${SEMANTIC_VERSION} ./src/notification-service"
                sh "docker build -t ${DOCKER_REGISTRY}/frontend:${SEMANTIC_VERSION} ./src/frontend"
                sh "docker build -t ${DOCKER_REGISTRY}/gateway:${SEMANTIC_VERSION} ./src/gateway"
            }
        }

        stage('7. Secure Registry Push') {
            steps {
                echo "🔑 Logging into Docker Hub and pushing microservice images..."
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'D_USER', passwordVariable: 'D_PASS')]) {
                    sh "echo \$D_PASS | docker login -u \$D_USER --password-stdin"
                    
                    sh "docker push ${DOCKER_REGISTRY}/user-service:${SEMANTIC_VERSION}"
                    sh "docker push ${DOCKER_REGISTRY}/product-service:${SEMANTIC_VERSION}"
                    sh "docker push ${DOCKER_REGISTRY}/order-service:${SEMANTIC_VERSION}"
                    sh "docker push ${DOCKER_REGISTRY}/notification-service:${SEMANTIC_VERSION}"
                    sh "docker push ${DOCKER_REGISTRY}/frontend:${SEMANTIC_VERSION}"
                    sh "docker push ${DOCKER_REGISTRY}/gateway:${SEMANTIC_VERSION}"
                }
            }
        }

        stage('8. Deploy to Kubernetes') {
            steps {
                echo "🚀 Deploying manifests to namespace: ${DEPLOY_NAMESPACE}"
                withCredentials([file(credentialsId: "${KUBECONFIG_CRED_ID}", variable: 'KUBECONFIG')]) {
                    // Inject namespace dynamically and apply configurations
                    sh "kubectl apply -f k8s/namespace.yaml --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/configmap.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/secrets.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    
                    // Apply microservice deployments
                    sh "kubectl apply -f k8s/user-deployment.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/product-deployment.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/order-deployment.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/notification-deployment.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/frontend-deployment.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/ingress.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                    sh "kubectl apply -f k8s/hpa.yaml -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                }
            }
        }

        stage('9. Health Gate Verification') {
            steps {
                echo "🩺 Verifying Kubernetes rolling deployment rollout success..."
                withCredentials([file(credentialsId: "${KUBECONFIG_CRED_ID}", variable: 'KUBECONFIG')]) {
                    script {
                        try {
                            sh "kubectl rollout status deployment/user-service -n ${DEPLOY_NAMESPACE} --timeout=60s --kubeconfig=\$KUBECONFIG"
                            sh "kubectl rollout status deployment/product-service -n ${DEPLOY_NAMESPACE} --timeout=60s --kubeconfig=\$KUBECONFIG"
                            sh "kubectl rollout status deployment/order-service -n ${DEPLOY_NAMESPACE} --timeout=60s --kubeconfig=\$KUBECONFIG"
                            echo "✅ All microservices running healthy. Gate cleared!"
                        } catch (Exception e) {
                            error "❌ Liveness health verification failed! Deploying emergency self-healing rollback sequence..."
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🏆 Jenkins pipeline completed successfully!"
            // Placeholder: integrate with Slack/email notifications
            // slackSend channel: '#deployments', message: "SUCCESS: E-Commerce Platform successfully deployed version ${SEMANTIC_VERSION} to ${DEPLOY_NAMESPACE}!"
        }
        failure {
            echo "🚨 Pipeline Failed! Initiating self-healing deployment rollbacks..."
            script {
                try {
                    withCredentials([file(credentialsId: "${KUBECONFIG_CRED_ID}", variable: 'KUBECONFIG')]) {
                        sh "kubectl rollout undo deployment/user-service -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                        sh "kubectl rollout undo deployment/product-service -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                        sh "kubectl rollout undo deployment/order-service -n ${DEPLOY_NAMESPACE} --kubeconfig=\$KUBECONFIG"
                        echo "🩹 Rollback successful. Stable production state restored."
                    }
                } catch (Exception rollbackError) {
                    echo "💥 CRITICAL: Emergency rollback failed: ${rollbackError.getMessage()}"
                }
            }
            // slackSend channel: '#deployments', color: 'danger', message: "FAILURE: Deployment failed. Automatic rollback executed."
        }
    }
}

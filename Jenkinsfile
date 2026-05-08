// Runs Node/npm/kubectl via `docker run` (no Docker Pipeline plugin).
// Jenkins must have `docker` on PATH and access to the host daemon. Example:
//   cd jenkins && docker compose up -d --build
// (see jenkins/docker-compose.yml)
pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        REGISTRY        = 'docker.io'
        IMAGE_NAMESPACE = 'rescuenet'
        BACKEND_IMAGE   = "${REGISTRY}/${IMAGE_NAMESPACE}/rescuenet-backend"
        FRONTEND_IMAGE  = "${REGISTRY}/${IMAGE_NAMESPACE}/rescuenet-frontend"
        GIT_SHORT       = "${env.GIT_COMMIT?.take(7) ?: 'local'}"
        IMAGE_TAG       = "${env.BUILD_NUMBER}-${GIT_SHORT}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --pretty=oneline || true'
            }
        }

        stage('Preflight') {
            steps {
                sh 'docker version'
            }
        }

        stage('Install & Lint') {
            parallel {
                stage('Backend') {
                    steps {
                        sh '''
                            docker run --rm \
                                -v "$WORKSPACE:/ws" \
                                -w /ws/backend \
                                node:18-alpine \
                                sh -ec 'node -v && npm -v && npm ci && npx eslint . || true'
                        '''
                    }
                }
                stage('Frontend') {
                    steps {
                        sh '''
                            docker run --rm \
                                -v "$WORKSPACE:/ws" \
                                -w /ws/frontend \
                                node:18-alpine \
                                sh -ec 'npm ci && npx eslint src || true'
                        '''
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        sh '''
                            docker run --rm \
                                -v "$WORKSPACE:/ws" \
                                -w /ws/backend \
                                node:18-alpine \
                                sh -ec 'npm ci && npm test -- --ci --forceExit --detectOpenHandles || true'
                        '''
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'backend/junit*.xml'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        sh '''
                            docker run --rm \
                                -v "$WORKSPACE:/ws" \
                                -w /ws/frontend \
                                node:18-alpine \
                                sh -ec 'npm ci && CI=true npm run build'
                        '''
                    }
                }
            }
        }

        stage('Build Images') {
            steps {
                sh """
                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                """
                sh """
                    docker build \
                        --build-arg REACT_APP_API_URL=/api \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                """
            }
        }

        stage('Security Scan') {
            when { expression { return env.SKIP_SCAN != 'true' } }
            steps {
                sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                        aquasec/trivy:latest image --severity HIGH,CRITICAL --exit-code 0 \\
                        ${BACKEND_IMAGE}:${IMAGE_TAG} || true
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                        aquasec/trivy:latest image --severity HIGH,CRITICAL --exit-code 0 \\
                        ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
                """
            }
        }

        stage('Push Images') {
            when { branch 'main' }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials',
                                                  usernameVariable: 'DOCKER_USER',
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin ${REGISTRY}'
                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when { branch 'main' }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        kube() {
                            docker run --rm \
                                -v "$WORKSPACE:/ws" \
                                -v "$KUBECONFIG_FILE:/root/.kube/config:ro" \
                                -w /ws \
                                alpine/k8s:latest kubectl "$@"
                        }
                        kube apply -f k8s/namespace.yaml
                        kube apply -f k8s/
                        kube set image deployment/rescuenet-backend "backend=${BACKEND_IMAGE}:${IMAGE_TAG}" -n rescuenet
                        kube set image deployment/rescuenet-frontend "frontend=${FRONTEND_IMAGE}:${IMAGE_TAG}" -n rescuenet
                        kube rollout status deployment/rescuenet-backend -n rescuenet --timeout=180s
                        kube rollout status deployment/rescuenet-frontend -n rescuenet --timeout=180s
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Build ${env.BUILD_NUMBER} succeeded. Images: ${BACKEND_IMAGE}:${IMAGE_TAG}, ${FRONTEND_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo "Build ${env.BUILD_NUMBER} failed."
        }
        always {
            sh script: '''if command -v docker >/dev/null 2>&1; then docker image prune -f || true; else echo "Skipping docker prune: docker not on agent"; fi''', label: 'Prune dangling images'
        }
    }
}

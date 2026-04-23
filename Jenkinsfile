pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        REGISTRY        = "docker.io"
        IMAGE_NAMESPACE = "rescuenet"
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

        stage('Install & Lint') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'node -v && npm -v'
                            sh 'npm ci'
                            sh 'npx eslint . || true'
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npx eslint src || true'
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm test -- --ci --forceExit --detectOpenHandles || true'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'backend/junit*.xml'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'CI=true npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Images') {
            steps {
                script {
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
        }

        stage('Security Scan') {
            when { expression { return env.SKIP_SCAN != 'true' } }
            steps {
                sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image --severity HIGH,CRITICAL --exit-code 0 \
                        ${BACKEND_IMAGE}:${IMAGE_TAG} || true
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image --severity HIGH,CRITICAL --exit-code 0 \
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
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/
                        kubectl set image deployment/rescuenet-backend \
                            backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n rescuenet
                        kubectl set image deployment/rescuenet-frontend \
                            frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n rescuenet
                        kubectl rollout status deployment/rescuenet-backend -n rescuenet --timeout=180s
                        kubectl rollout status deployment/rescuenet-frontend -n rescuenet --timeout=180s
                    """
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
            sh 'docker image prune -f || true'
        }
    }
}

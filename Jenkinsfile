pipeline {

    agent {
        label 'agent-node1'
    }

    environment {
        AWS_REGION     = 'us-east-1'
        AWS_ACCOUNT_ID = '880420038603'
        ECR_REPO       = 'nodejs-devops-repo'

        IMAGE_NAME = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out Node.js application code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'

                sh '''
                    cd app
                    npm install
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running Node.js application test...'

                sh '''
                    cd app
                    npm test
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"

                sh """
                    docker build \
                        -t ${ECR_REPO}:${IMAGE_TAG} \
                        ./app

                    docker tag \
                        ${ECR_REPO}:${IMAGE_TAG} \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Login to ECR') {
            steps {

                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'Anusha-alt817']
                ]) {

                    sh """
                        aws ecr get-login-password \
                            --region ${AWS_REGION} | \
                        docker login \
                            --username AWS \
                            --password-stdin \
                            ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Push Image to ECR') {
            steps {

                echo "Pushing image: ${IMAGE_NAME}:${IMAGE_TAG}"

                sh """
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to EKS') {
            steps {

                echo 'Deploying Node.js application to Kubernetes...'

                sh """
                    kubectl apply -f configmap.yaml
                    kubectl apply -f deployment.yaml
                    kubectl apply -f service.yaml
                    kubectl apply -f ingress.yaml

                    kubectl set image deployment/nodejs-deployment \
                        nodejs=${IMAGE_NAME}:${IMAGE_TAG}

                    kubectl rollout status deployment/nodejs-deployment
                """
            }
        }
    }

    post {

        success {
            echo "Pipeline completed successfully."
            echo "Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            echo 'Pipeline failed. Check the failed stage and console logs.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
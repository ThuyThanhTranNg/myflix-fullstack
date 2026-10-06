pipeline {
    agent any

    triggers { pollSCM('H/2 * * * *') }

    environment {
        FRONT_IMAGE = 'myflix-frontend'
        BACK_IMAGE  = 'myflix-backend'
        API_URL     = 'http://localhost:5000/api'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        docker build --build-arg REACT_APP_API_URL=$API_URL \
                          -t $DOCKER_USER/$FRONT_IMAGE:latest -t $DOCKER_USER/$FRONT_IMAGE:$BUILD_NUMBER .
                        docker build \
                          -t $DOCKER_USER/$BACK_IMAGE:latest -t $DOCKER_USER/$BACK_IMAGE:$BUILD_NUMBER ./backend
                    '''
                }
            }
        }

        stage('Push Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_USER/$FRONT_IMAGE:latest
                        docker push $DOCKER_USER/$FRONT_IMAGE:$BUILD_NUMBER
                        docker push $DOCKER_USER/$BACK_IMAGE:latest
                        docker push $DOCKER_USER/$BACK_IMAGE:$BUILD_NUMBER
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                        usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        export DOCKER_USER
                        docker compose -p myflix -f docker-compose.prod.yml down --remove-orphans || true
                        docker compose -p myflix -f docker-compose.prod.yml pull
                        docker compose -p myflix -f docker-compose.prod.yml up -d
                    '''
                }
            }
        }
    }

    post {
        always { sh 'docker logout || true' }
    }
}
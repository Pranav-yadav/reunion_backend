#!/bin/bash

# This script will setup and run the backend apis.
# build docker image
docker-compose build
docker-compose up -d
# echo ""

# check if container is running
# docker ps -a
# echo ""

# check if everything is running without errors with logs
# docker logs backend

# echo "✅ Backend apis running at http://localhost:3000"
# echo ""

# docker ps -a && docker images
# docker stop backend
# docker rm backend
# docker rmi backend

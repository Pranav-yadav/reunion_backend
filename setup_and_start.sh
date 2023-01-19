#!/bin/bash

# This script will setup and run the backend apis.
# build docker image
echo "[1/2] Building docker image."
docker build -t backend .

# run docker container
echo "[2/2] Running docker container."
docker run -d -p 3000:3000 --name backend backend:latest
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

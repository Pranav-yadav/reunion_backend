#!/bin/bash

# This script will setup and run the backend apis.
# build docker image
echo "[1/2] Building docker image."
docker build -t backend .

# run docker container
echo "[2/2] Running docker container."
docker run -d -p 3000:3000 --name backend backend:latest

# check if container is running
docker ps -a

# check if everything is running without errors with logs
docker logs backend

# visit the webapp
echo "✅ Backend apis running at http://localhost:3000"
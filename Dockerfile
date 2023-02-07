# This file is used to build the Docker image (multi-stage) for the application
# build the image by running:
# $ docker build -t backend .

# Use official Node.js Alpine image as the base image
FROM node:alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Copy the .env.sample file to .env
RUN cp .env.sample .env

# Use official MongoDB image as the base image
FROM mongo:latest

# Set the working directory
WORKDIR /app

# Copy the data directory
COPY --from=builder /app/data/ /app/data/

# Copy the init-mongo.sh script
COPY --from=builder init-mongo.sh /docker-entrypoint-initdb.d/

# Expose the MongoDB port
EXPOSE 27017

# Start MongoDB
CMD ["mongod"]

# Use official Node.js Alpine image as the base image
FROM node:alpine

# Set the working directory
WORKDIR /app

# Copy the built application
COPY --from=builder /app/ /app/

# Copy the .env file
COPY --from=builder /app/.env /app/

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

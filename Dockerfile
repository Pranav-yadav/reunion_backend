# This file is used to build the Docker image for the application
# build the image by running:
# $ docker build -t my-app .

# Use official MongoDB image
FROM mongo:latest

# Set the working directory
WORKDIR /app

# Copy mongod.conf
COPY mongod.conf /etc/mongod.conf
# Copy the data directory
COPY data/ /app/data/
# Copy the init-mongo.sh script
COPY init-mongo.sh /docker-entrypoint-initdb.d/

# Expose the MongoDB port
EXPOSE 27017

# Start MongoDB
CMD ["mongod", "--config", "/etc/mongod.conf"]

# Use official Node.js image
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

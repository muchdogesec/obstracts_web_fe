# Use an official Node.js runtime as a parent image
FROM node:16 AS build

# Set build arguments
ARG REACT_APP_AUTH0_DOMAIN
ARG REACT_APP_AUTH0_CLIENT_ID
ARG REACT_APP_API_BASE_URL

# Set environment variables
ENV REACT_APP_AUTH0_DOMAIN=${REACT_APP_AUTH0_DOMAIN}
ENV REACT_APP_AUTH0_CLIENT_ID=${REACT_APP_AUTH0_CLIENT_ID}
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV TEST=true

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Test env variable
RUN printenv

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# # Build the React app
RUN npm run build


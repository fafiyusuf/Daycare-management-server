#!/bin/bash

# Docker build script

echo "🔨 Building Docker images..."

# Build development image
echo "Building development image..."
docker build --target development -t nextjs-app:dev .

# Build production image
echo "Building production image..."
docker build --target runner -t nextjs-app:prod .

# Build nginx image
echo "Building nginx image..."
docker build -f Dockerfile.nginx -t nextjs-nginx:latest .

echo "✅ All images built successfully!"

# Show images
docker images | grep -E "(nextjs-app|nextjs-nginx)"

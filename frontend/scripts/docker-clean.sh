#!/bin/bash

# Docker cleanup script

echo "🧹 Cleaning up Docker resources..."

# Stop all containers
echo "Stopping containers..."
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down

# Remove unused images
echo "Removing unused images..."
docker image prune -f

# Remove unused volumes
echo "Removing unused volumes..."
docker volume prune -f

# Remove unused networks
echo "Removing unused networks..."
docker network prune -f

echo "✅ Cleanup completed!"

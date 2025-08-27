#!/bin/bash
# startup.sh - Startup script for SSGI Daycare Frontend in production

set -e  # Exit on error

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "Docker and/or Docker Compose are not installed. Please run the deploy.sh script first."
    exit 1
fi

# Start the containers
echo "Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Check if containers are running
echo "Checking container status..."
sleep 5
if [ "$(docker ps -q -f name=nextjs-prod)" ] && [ "$(docker ps -q -f name=nginx-prod)" ]; then
    echo "All containers are running!"
    echo "Your application should be accessible at https://$(hostname -f)"
else
    echo "Some containers failed to start. Check logs with:"
    echo "docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

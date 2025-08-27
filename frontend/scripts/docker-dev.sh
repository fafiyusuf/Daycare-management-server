#!/bin/bash

# Development Docker script

echo "🚀 Starting Next.js development environment with Docker..."

# Load development environment variables
if [ -f .env.docker.dev ]; then
    export $(cat .env.docker.dev | grep -v '#' | xargs)
fi

# Build and start development containers
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Development environment started!"
echo "🌐 Application available at: http://localhost:${DEV_PORT:-3000}"

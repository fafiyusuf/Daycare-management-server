#!/bin/bash

# Production Docker script

echo "🚀 Starting Next.js production environment with Docker..."

# Load production environment variables
if [ -f .env.docker ]; then
    export $(cat .env.docker | grep -v '#' | xargs)
fi

# Build and start production containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

echo "✅ Production environment started!"
echo "🌐 Application available at: http://localhost:${NGINX_PORT:-80}"
echo "📊 Health check: http://localhost:${NGINX_PORT:-80}/health"

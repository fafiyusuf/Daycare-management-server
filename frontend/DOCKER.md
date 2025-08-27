# Docker Setup for Next.js with TypeScript and Tailwind CSS

This document provides comprehensive instructions for running the Next.js application using Docker in both development and production environments.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Make (optional, for using Makefile commands)

## Quick Start

### Development Environment

1. **Start development environment:**
   \`\`\`bash
   chmod +x scripts/docker-dev.sh
   ./scripts/docker-dev.sh
   \`\`\`

   Or manually:
   \`\`\`bash
   docker-compose -f docker-compose.dev.yml up --build
   \`\`\`

2. **Access the application:**
   - Application: http://localhost:3000
   - Hot reload enabled with volume mounting

### Production Environment

1. **Start production environment:**
   \`\`\`bash
   chmod +x scripts/docker-prod.sh
   ./scripts/docker-prod.sh
   \`\`\`

   Or manually:
   \`\`\`bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   \`\`\`

2. **Access the application:**
   - Application: http://localhost:80
   - Health check: http://localhost:80/health

## Docker Architecture

### Multi-Stage Dockerfile

The Dockerfile uses multi-stage builds for optimization:

1. **deps**: Installs dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Production runtime (optimized)
4. **development**: Development environment with hot reload

### Services

- **nextjs**: Next.js application server
- **nginx**: Reverse proxy and static file server

## Environment Variables

### Development (.env.docker.dev)
\`\`\`env
NEXT_PUBLIC_APP_NAME="Next.js Dev App"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEV_PORT=3000
NODE_ENV=development
\`\`\`

### Production (.env.docker)
\`\`\`env
NEXT_PUBLIC_APP_NAME="Next.js Docker App"
NEXT_PUBLIC_APP_URL="http://localhost"
NGINX_PORT=80
NODE_ENV=production
\`\`\`

## Available Scripts

### Build Scripts
\`\`\`bash
# Build all images
./scripts/docker-build.sh

# Build specific target
docker build --target development -t nextjs-app:dev .
docker build --target runner -t nextjs-app:prod .
\`\`\`

### Management Scripts
\`\`\`bash
# Start development
./scripts/docker-dev.sh

# Start production
./scripts/docker-prod.sh

# Clean up resources
./scripts/docker-clean.sh
\`\`\`

## Docker Compose Commands

### Development
\`\`\`bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
\`\`\`

### Production
\`\`\`bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale nextjs=3

# View logs
docker-compose -f docker-compose.yml logs -f

# Stop services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
\`\`\`

## Nginx Configuration

The Nginx service provides:

- Reverse proxy to Next.js application
- Static asset caching
- Gzip compression
- Security headers
- Health check endpoint
- SSL/TLS termination (production)

### Custom Nginx Configuration

To modify Nginx settings, edit:
- \`nginx/nginx.conf\` - Main configuration
- \`nginx/default.conf\` - Server block configuration

## Performance Optimizations

### Docker Image Optimization
- Multi-stage builds reduce final image size
- Only production dependencies in final image
- Non-root user for security
- Health checks for reliability

### Next.js Optimizations
- Standalone output for smaller containers
- Disabled source maps in production
- Compression enabled
- Static asset optimization

### Nginx Optimizations
- Gzip compression
- Static asset caching
- Connection keep-alive
- Worker process optimization

## Monitoring and Health Checks

### Health Check Endpoints
- Next.js: \`/api/health\`
- Nginx: \`/health\`

### Docker Health Checks
Both services include Docker health checks:
\`\`\`yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
\`\`\`

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   \`\`\`bash
   # Check port usage
   lsof -i :3000
   lsof -i :80
   
   # Change ports in environment files
   \`\`\`

2. **Permission issues:**
   \`\`\`bash
   # Make scripts executable
   chmod +x scripts/*.sh
   \`\`\`

3. **Build failures:**
   \`\`\`bash
   # Clean Docker cache
   docker builder prune
   
   # Rebuild without cache
   docker-compose build --no-cache
   \`\`\`

### Debugging

1. **View container logs:**
   \`\`\`bash
   docker-compose logs nextjs
   docker-compose logs nginx
   \`\`\`

2. **Execute commands in container:**
   \`\`\`bash
   docker-compose exec nextjs sh
   docker-compose exec nginx sh
   \`\`\`

3. **Inspect container:**
   \`\`\`bash
   docker inspect nextjs-app
   \`\`\`

## Security Considerations

- Non-root user in containers
- Security headers in Nginx
- Environment variable isolation
- Network isolation between services
- Regular base image updates

## Deployment

### CI/CD Integration
The included GitHub Actions workflow:
- Builds Docker images
- Pushes to GitHub Container Registry
- Supports multi-environment deployment

### Production Deployment
1. Set production environment variables
2. Configure SSL certificates
3. Set up monitoring and logging
4. Configure backup strategies
5. Implement rolling updates

## Resource Management

### Development
- CPU: 0.5-1.0 cores
- Memory: 512MB-1GB
- Storage: 2-5GB

### Production
- CPU: 1-2 cores per replica
- Memory: 1-2GB per replica
- Storage: 5-10GB
- Consider horizontal scaling

## Support

For issues related to:
- Docker configuration: Check Docker documentation
- Next.js application: Check Next.js documentation
- Nginx configuration: Check Nginx documentation

## License

This Docker configuration is part of the Next.js starter template and follows the same MIT license.
\`\`\`
\`\`\`

```makefile file="Makefile"
# Makefile for Docker operations

.PHONY: help dev prod build clean logs shell test

# Default target
help:
	@echo "Available commands:"
	@echo "  dev     - Start development environment"
	@echo "  prod    - Start production environment"
	@echo "  build   - Build all Docker images"
	@echo "  clean   - Clean up Docker resources"
	@echo "  logs    - View application logs"
	@echo "  shell   - Open shell in running container"
	@echo "  test    - Run tests in container"
	@echo "  stop    - Stop all services"

# Development environment
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-bg:
	@echo "🚀 Starting development environment in background..."
	docker-compose -f docker-compose.dev.yml up --build -d

# Production environment
prod:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Build images
build:
	@echo "🔨 Building Docker images..."
	docker build --target development -t nextjs-app:dev .
	docker build --target runner -t nextjs-app:prod .
	docker build -f Dockerfile.nginx -t nextjs-nginx:latest .

# Clean up
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose -f docker-compose.yml down --remove-orphans
	docker-compose -f docker-compose.dev.yml down --remove-orphans
	docker-compose -f docker-compose.prod.yml down --remove-orphans
	docker system prune -f

# View logs
logs:
	docker-compose logs -f

logs-dev:
	docker-compose -f docker-compose.dev.yml logs -f

# Open shell
shell:
	docker-compose exec nextjs sh

shell-nginx:
	docker-compose exec nginx sh

# Run tests
test:
	docker-compose -f docker-compose.dev.yml exec nextjs pnpm test

# Stop services
stop:
	docker-compose -f docker-compose.yml down
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.prod.yml down

# Restart services
restart: stop prod

# Update images
update:
	docker-compose pull
	docker-compose -f docker-compose.dev.yml pull

# SSGI Daycare Management System - Frontend

This is the frontend application for the SSGI Daycare Management System, built with Next.js, TypeScript, and Tailwind CSS.

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file with environment variables:
   ```
   NEXT_PUBLIC_APP_NAME=SSGI Daycare
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```

## Docker Development

For Docker-based development:

```bash
# Start development containers
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

## Production Deployment on Ubuntu Server

### Prerequisites

- Ubuntu Server (20.04 LTS or newer)
- Root access or sudo privileges
- Domain name configured to point to your server
- Open ports 80 and 443

### Deployment Steps

1. Clone the repository on your Ubuntu server:
   ```bash
   git clone https://your-repository-url.git
   cd Day-care-FrontEnd
   ```

2. Make the deployment script executable:
   ```bash
   chmod +x scripts/deploy.sh
   ```

3. Run the deployment script:
   ```bash
   sudo ./scripts/deploy.sh
   ```

4. After deployment, edit the `.env` file to update the domain settings:
   ```bash
   sudo nano .env
   ```
   Update the following values with your actual domain:
   ```
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api
   ```

5. Restart the services to apply the changes:
   ```bash
   chmod +x scripts/startup.sh
   ./scripts/startup.sh
   ```

### SSL Certificates

The deployment automatically creates self-signed SSL certificates. For production use, you should replace them with Let's Encrypt or other trusted certificates:

1. Obtain certificates from Let's Encrypt using certbot
2. Place the certificates in the `./ssl` directory:
   - `./ssl/cert.pem` (fullchain.pem from Let's Encrypt)
   - `./ssl/key.pem` (privkey.pem from Let's Encrypt)

### Maintenance

- **View logs:**
  ```bash
  docker-compose -f docker-compose.prod.yml logs -f
  ```

- **Restart services:**
  ```bash
  docker-compose -f docker-compose.prod.yml restart
  ```

- **Update the application:**
  ```bash
  git pull
  sudo ./scripts/deploy.sh
  ```

## Security Considerations

1. The application uses JWT authentication with refresh tokens
2. All API requests are secured with HTTPS
3. Nginx is configured with security headers
4. Production builds have source maps disabled for security

## Performance Optimizations

1. Nginx is configured for optimal caching of static assets
2. Gzip compression is enabled
3. Next.js output is set to "standalone" for optimal Docker performance
4. Resource limits are set in the Docker Compose configuration
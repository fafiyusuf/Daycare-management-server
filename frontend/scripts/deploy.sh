#!/bin/bash
# deploy.sh - Deployment script for SSGI Daycare Frontend

set -e  # Exit on error

# Ensure script is run as root
if [ "$(id -u)" -ne 0 ]; then
   echo "This script must be run as root" 
   exit 1
fi

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker and Docker Compose if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create SSL directory if not exists
mkdir -p ./ssl

# Check if SSL certificates exist, if not, create self-signed certificates
if [ ! -f ./ssl/cert.pem ] || [ ! -f ./ssl/key.pem ]; then
    echo "Creating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./ssl/key.pem \
        -out ./ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    chmod 600 ./ssl/key.pem ./ssl/cert.pem
fi

# Create .env file with production settings if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file with production settings..."
    cat > .env << EOL
# Production environment variables
NEXT_PUBLIC_APP_NAME=SSGI Daycare
NEXT_PUBLIC_APP_URL=https://$(hostname -f)
NEXT_PUBLIC_API_BASE_URL=https://api.$(hostname -f)/api
NODE_ENV=production

# NGINX settings
NGINX_PORT=80
NGINX_SSL_PORT=443
EOL
    echo "Please update the .env file with your domain and API URL"
fi

# Build and start the containers
echo "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Setup firewall if UFW is installed
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
fi

echo "Deployment completed successfully!"
echo "Your application should be accessible at https://$(hostname -f)"
echo "Please ensure your DNS records are properly configured."

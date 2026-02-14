#!/bin/bash

# 1. Install Docker & Docker Compose (if missing)
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    # Use sudo if user is not root, passing password via -S for non-interactive sudo
    if [ "$EUID" -ne 0 ]; then
        echo "$SSHPASS" | sudo -S sh get-docker.sh
        # Add current user to docker group
        echo "$SSHPASS" | sudo -S usermod -aG docker $USER
    else
        sh get-docker.sh
    fi
fi

# 2. Setup Environment
echo "Setting up environment..."

# Stop conflicting host services (Apache/Nginx) that hog Port 80
echo "Stopping potential conflicting web servers on host..."
if systemctl is-active --quiet apache2; then
    echo "Stopping Apache2..."
    echo "$SSHPASS" | sudo -S systemctl stop apache2
    echo "$SSHPASS" | sudo -S systemctl disable apache2
fi
if systemctl is-active --quiet nginx; then
    echo "Stopping Host Nginx..."
    echo "$SSHPASS" | sudo -S systemctl stop nginx
    echo "$SSHPASS" | sudo -S systemctl disable nginx
fi

# Ensure Firewall allows Port 80 (Disable ufw to be safe)
echo "Configuring firewall..."
echo "$SSHPASS" | sudo -S ufw allow 80
echo "$SSHPASS" | sudo -S ufw allow 443
echo "Firewall status:"
echo "$SSHPASS" | sudo -S ufw status
# echo "$SSHPASS" | sudo -S ufw disable # Uncomment if firewall issues persist

if [ -f ".env" ]; then
    echo "Using existing .env file (likely injected by CI)"
    
elif [ -f "infra/production.env" ]; then
    cp infra/production.env .env
    echo "Loaded configuration from infra/production.env"
else
    echo "Warning: infra/production.env not found. Ensure .env exists or variables are set."
fi

# 3. Build and Start
echo "Building and starting services..."

# Define Docker Compose Command (Handle V1 vs V2 and Sudo)
DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "Error: Docker Compose not found."
    exit 1
fi

# Run Docker Compose (with sudo if needed)
DOWN_CMD="$DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml down"
if [ "$RESET_DB" == "true" ]; then
    echo "⚠️ RESET_DB is set to true. Wiping database volumes..."
    DOWN_CMD="$DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml down -v"
fi

if groups $USER | grep &>/dev/null 'docker'; then
    # User is in docker group
    $DOWN_CMD
    $DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml up -d --build
else
    # User needs sudo
    echo "User not in docker group, using sudo..."
    echo "$SSHPASS" | sudo -S $DOWN_CMD
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml up -d --build
fi

echo "Deployment complete! Check status with: docker compose -f infra/docker-compose.prod.yml ps"

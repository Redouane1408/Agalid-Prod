#!/bin/bash

set -e

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

mkdir -p infra

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

if systemctl is-active --quiet caddy; then
    echo "Stopping Caddy..."
    echo "$SSHPASS" | sudo -S systemctl stop caddy
    echo "$SSHPASS" | sudo -S systemctl disable caddy
fi

if [ -f ".env" ]; then
    echo "Using existing .env file (likely injected by CI)"
    cp .env infra/production.env
    echo "Synced .env to infra/production.env"
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
    echo "Checking port conflicts (80/443)..."
    if command -v ss &> /dev/null; then
        ss -ltnp | grep -E ':(80|443)\s' || true
    fi
    CONFLICT_IDS="$(docker ps --format '{{.ID}}\t{{.Ports}}' | awk '$2 ~ /0\\.0\\.0\\.0:80->|:::80->|0\\.0\\.0\\.0:443->|:::443->/ {print $1}' | tr '\n' ' ')"
    if [ -n "$CONFLICT_IDS" ]; then
        echo "Stopping containers using 80/443: $CONFLICT_IDS"
        docker stop $CONFLICT_IDS || true
        docker rm $CONFLICT_IDS || true
    fi
    $DOWN_CMD --remove-orphans
    $DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml up -d --build --force-recreate --remove-orphans
else
    # User needs sudo
    echo "User not in docker group, using sudo..."
    echo "Checking port conflicts (80/443)..."
    if command -v ss &> /dev/null; then
        ss -ltnp | grep -E ':(80|443)\s' || true
    fi
    CONFLICT_IDS="$(echo "$SSHPASS" | sudo -S docker ps --format '{{.ID}}\t{{.Ports}}' | awk '$2 ~ /0\\.0\\.0\\.0:80->|:::80->|0\\.0\\.0\\.0:443->|:::443->/ {print $1}' | tr '\n' ' ')"
    if [ -n "$CONFLICT_IDS" ]; then
        echo "Stopping containers using 80/443: $CONFLICT_IDS"
        echo "$SSHPASS" | sudo -S docker stop $CONFLICT_IDS || true
        echo "$SSHPASS" | sudo -S docker rm $CONFLICT_IDS || true
    fi
    echo "$SSHPASS" | sudo -S $DOWN_CMD --remove-orphans
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml up -d --build --force-recreate --remove-orphans
fi

echo "Deployed git commit: ${GIT_COMMIT_SHA:-unknown}"
echo "Deployment complete! Check status with: docker compose -f infra/docker-compose.prod.yml ps"

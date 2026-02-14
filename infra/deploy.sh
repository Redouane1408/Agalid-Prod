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

# Ensure no container is currently binding to ports 80/443 (old stack or stray containers)
echo "Checking for containers binding to ports 80/443..."
if groups $USER | grep &>/dev/null 'docker'; then
    PORT_CONTAINERS=$(docker ps -q --filter "publish=80" --filter "publish=443")
    if [ -n "$PORT_CONTAINERS" ]; then
        echo "Stopping and removing containers on 80/443: $PORT_CONTAINERS"
        docker stop $PORT_CONTAINERS || true
        docker rm $PORT_CONTAINERS || true
    else
        echo "No containers currently binding 80/443."
    fi
else
    PORT_CONTAINERS=$(echo "$SSHPASS" | sudo -S docker ps -q --filter "publish=80" --filter "publish=443")
    if [ -n "$PORT_CONTAINERS" ]; then
        echo "Stopping and removing containers on 80/443 (sudo): $PORT_CONTAINERS"
        echo "$SSHPASS" | sudo -S docker stop $PORT_CONTAINERS || true
        echo "$SSHPASS" | sudo -S docker rm $PORT_CONTAINERS || true
    else
        echo "No containers currently binding 80/443 (sudo check)."
    fi
fi

# Project names (stack names)
OLD_STACK="${OLD_STACK:-agalid}"
STACK_NAME="${STACK_NAME:-agalid_v2}"

# Run Docker Compose (with sudo if needed)
DOWN_CMD="$DOCKER_COMPOSE_CMD -p $OLD_STACK -f infra/docker-compose.prod.yml down"
if [ "$RESET_DB" == "true" ]; then
    echo "⚠️ RESET_DB is set to true. Wiping database volumes..."
    DOWN_CMD="$DOCKER_COMPOSE_CMD -p $OLD_STACK -f infra/docker-compose.prod.yml down -v"
fi

if groups $USER | grep &>/dev/null 'docker'; then
    # User is in docker group
    $DOWN_CMD
    $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml up -d --build
    $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml exec -T server npx prisma migrate deploy
    echo "Containers status:"
    $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml ps
    echo "Recent logs (server):"
    $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml logs --tail=150 server || true
    echo "Recent logs (proxy):"
    $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml logs --tail=50 proxy || true
else
    # User needs sudo
    echo "User not in docker group, using sudo..."
    echo "$SSHPASS" | sudo -S $DOWN_CMD
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml up -d --build
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml exec -T server npx prisma migrate deploy
    echo "Containers status:"
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml ps
    echo "Recent logs (server):"
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml logs --tail=150 server || true
    echo "Recent logs (proxy):"
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -p $STACK_NAME -f infra/docker-compose.prod.yml logs --tail=50 proxy || true
fi

echo "Deployment complete! Current stack: $STACK_NAME"
echo "Check status with: docker compose -p $STACK_NAME -f infra/docker-compose.prod.yml ps"

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

free_ports() {
    echo "Checking port conflicts (80/443)..."
    if command -v ss &> /dev/null; then
        echo "$SSHPASS" | sudo -S ss -ltnp | grep -E ':(80|443)\s' || true
    fi

    for port in 80 443; do
        if groups $USER | grep &>/dev/null 'docker'; then
            IDS="$(docker ps -q --filter "publish=$port" | tr '\n' ' ')"
            if [ -n "$IDS" ]; then
                echo "Stopping containers publishing $port: $IDS"
                docker stop $IDS || true
                docker rm $IDS || true
            fi
        else
            IDS="$(echo "$SSHPASS" | sudo -S docker ps -q --filter "publish=$port" | tr '\n' ' ')"
            if [ -n "$IDS" ]; then
                echo "Stopping containers publishing $port: $IDS"
                echo "$SSHPASS" | sudo -S docker stop $IDS || true
                echo "$SSHPASS" | sudo -S docker rm $IDS || true
            fi
        fi
    done

    if command -v ss &> /dev/null; then
        STILL_LISTENING="$(echo "$SSHPASS" | sudo -S ss -ltnp | grep -E ':(80|443)\s' || true)"
        if [ -n "$STILL_LISTENING" ]; then
            echo "Ports still in use, attempting to kill listeners..."
            if command -v fuser &> /dev/null; then
                echo "$SSHPASS" | sudo -S fuser -k 80/tcp || true
                echo "$SSHPASS" | sudo -S fuser -k 443/tcp || true
            fi
            echo "$SSHPASS" | sudo -S ss -ltnp | grep -E ':(80|443)\s' || true
        fi
    fi
}

wait_for_api() {
    echo "Waiting for API to become ready..."

    if docker compose version &> /dev/null; then
        DC="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DC="docker-compose"
    else
        echo "Error: Docker Compose not found."
        exit 1
    fi

    if groups $USER | grep &>/dev/null 'docker'; then
        SERVER_ID=$($DC -f infra/docker-compose.prod.yml ps -q server || true)
    else
        SERVER_ID="$(echo "$SSHPASS" | sudo -S $DC -f infra/docker-compose.prod.yml ps -q server || true)"
    fi

    if [ -z "$SERVER_ID" ]; then
        echo "Error: server container not found"
        exit 1
    fi

    for i in {1..60}; do
        if groups $USER | grep &>/dev/null 'docker'; then
            RUNNING="$(docker inspect -f '{{.State.Running}}' "$SERVER_ID" 2>/dev/null || echo false)"
            if [ "$RUNNING" != "true" ]; then
                echo "API check $i/60 -> container not running yet"
                sleep 5
                continue
            fi
            STATUS="$(docker exec "$SERVER_ID" sh -lc 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/health || true' 2>/dev/null || true)"
        else
            RUNNING="$(echo "$SSHPASS" | sudo -S docker inspect -f '{{.State.Running}}' "$SERVER_ID" 2>/dev/null || echo false)"
            if [ "$RUNNING" != "true" ]; then
                echo "API check $i/60 -> container not running yet"
                sleep 5
                continue
            fi
            STATUS="$(echo "$SSHPASS" | sudo -S docker exec "$SERVER_ID" sh -lc 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/health || true' 2>/dev/null || true)"
        fi

        echo "API check $i/60 -> $STATUS"
        if [ "$STATUS" = "200" ]; then
            echo "API is ready"
            return 0
        fi
        sleep 5
    done

    echo "API did not become ready. Printing logs..."
    if groups $USER | grep &>/dev/null 'docker'; then
        $DC -f infra/docker-compose.prod.yml ps || true
        $DC -f infra/docker-compose.prod.yml logs --tail 200 server || true
        $DC -f infra/docker-compose.prod.yml logs --tail 200 proxy || true
    else
        echo "$SSHPASS" | sudo -S $DC -f infra/docker-compose.prod.yml ps || true
        echo "$SSHPASS" | sudo -S $DC -f infra/docker-compose.prod.yml logs --tail 200 server || true
        echo "$SSHPASS" | sudo -S $DC -f infra/docker-compose.prod.yml logs --tail 200 proxy || true
    fi
    return 1
}

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

fix_database_url_host() {
    target_file="$1"
    if [ ! -f "$target_file" ]; then
        return 0
    fi

    if ! grep -qE '^[[:space:]]*DATABASE_URL=' "$target_file"; then
        return 0
    fi

    if grep -qE '^[[:space:]]*DATABASE_URL=.*@(localhost|127\.0\.0\.1|0\.0\.0\.0):' "$target_file"; then
        tmp_file="$(mktemp)"
        sed -E 's#^([[:space:]]*DATABASE_URL=["'"'"']?postgresql://[^@]+@)(localhost|127\.0\.0\.1|0\.0\.0\.0):[0-9]+/#\1postgres:5432/#' "$target_file" > "$tmp_file"
        mv "$tmp_file" "$target_file"
        echo "Patched DATABASE_URL host in $target_file (localhost -> postgres)"
    fi
}

echo "Verifying env keys presence..."
if [ -f ".env" ]; then
    grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env | cut -d= -f1 | head -n 80 || true
fi
fix_database_url_host ".env"
fix_database_url_host "infra/production.env"

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
    free_ports
    $DOWN_CMD --remove-orphans
    $DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml up -d --build --force-recreate --remove-orphans
    wait_for_api
else
    # User needs sudo
    echo "User not in docker group, using sudo..."
    free_ports
    echo "$SSHPASS" | sudo -S $DOWN_CMD --remove-orphans
    echo "$SSHPASS" | sudo -S $DOCKER_COMPOSE_CMD -f infra/docker-compose.prod.yml up -d --build --force-recreate --remove-orphans
    wait_for_api
fi

echo "Deployed git commit: ${GIT_COMMIT_SHA:-unknown}"
echo "Deployment complete! Check status with: docker compose -f infra/docker-compose.prod.yml ps"

#!/bin/bash

# 1. Install Docker & Docker Compose (if missing)
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# 2. Setup Environment
echo "Setting up environment..."
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
docker compose -f infra/docker-compose.prod.yml down
docker compose -f infra/docker-compose.prod.yml up -d --build

echo "Deployment complete! Check status with: docker compose -f infra/docker-compose.prod.yml ps"

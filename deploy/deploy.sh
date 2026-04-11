#!/usr/bin/env bash
set -euo pipefail

# =============================================================
# YesBoss Backend - Oracle Cloud VM Deployment Script
# =============================================================
# Run on a fresh Oracle Cloud Ubuntu/Oracle Linux VM.
# Prerequisites: Docker + Docker Compose installed.
#
# Usage:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh
# =============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="/opt/yesboss"

echo "=== YesBoss Backend Deployment ==="

# ---- 1. Install Docker if not present ----
if ! command -v docker &> /dev/null; then
    echo "[1/6] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "Docker installed. You may need to log out and back in."
else
    echo "[1/6] Docker already installed."
fi

# ---- 2. Install Docker Compose plugin if not present ----
if ! docker compose version &> /dev/null; then
    echo "[2/6] Installing Docker Compose plugin..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
else
    echo "[2/6] Docker Compose already available."
fi

# ---- 3. Create deployment directory ----
echo "[3/6] Setting up deployment directory..."
sudo mkdir -p "$DEPLOY_DIR"/{keys,config}
sudo cp -r "$PROJECT_ROOT/docker" "$DEPLOY_DIR/docker"
sudo cp "$SCRIPT_DIR/.env.production" "$DEPLOY_DIR/.env" 2>/dev/null || true

# ---- 4. Generate JWT keys if not present ----
if [ ! -f "$DEPLOY_DIR/keys/private.pem" ]; then
    echo "[4/6] Generating RSA key pair for JWT..."
    openssl genrsa -out "$DEPLOY_DIR/keys/private.pem" 2048
    openssl rsa -in "$DEPLOY_DIR/keys/private.pem" -pubout -out "$DEPLOY_DIR/keys/public.pem"
    echo "Keys generated at $DEPLOY_DIR/keys/"
else
    echo "[4/6] JWT keys already exist."
fi

# ---- 5. Build and start services ----
echo "[5/6] Building and starting services..."
cd "$DEPLOY_DIR"

# Load env
if [ ! -f .env ]; then
    echo "ERROR: .env file not found at $DEPLOY_DIR/.env"
    echo "Copy deploy/.env.production to $DEPLOY_DIR/.env and fill in the values."
    exit 1
fi

source .env

# Set keys directory
export KEYS_DIR="$DEPLOY_DIR/keys"

# Build and start
docker compose -f docker/docker-compose.yml build
docker compose -f docker/docker-compose.yml up -d

echo "[6/6] Waiting for services to be healthy..."
sleep 10

# ---- 6. Verify ----
echo ""
echo "=== Deployment Status ==="
docker compose -f docker/docker-compose.yml ps

echo ""
echo "=== Health Check ==="
curl -s http://localhost:3000/health || echo "Gateway not responding yet (may need a moment)"

echo ""
echo "=== Next Steps ==="
echo "1. Create an admin user:"
echo "   curl -X POST http://localhost:3000/api/auth/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@yesboss.io\",\"name\":\"Admin\",\"password\":\"YOUR_PASSWORD\",\"organizationId\":\"will-create\"}'"
echo ""
echo "2. Install and configure OpenClaw on this server"
echo "3. Map phone numbers: POST /api/auth/phone-mappings"
echo "4. Set up Nginx + SSL for public access (see deploy/nginx.conf)"

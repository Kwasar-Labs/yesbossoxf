#!/usr/bin/env bash
set -euo pipefail

# =============================================================
# WSL2 Setup Script - Run once on your Windows WSL2 machine
# =============================================================

echo "=== YesBoss WSL2 Development Setup ==="

# ---- 1. Install Docker Desktop integration ----
if ! command -v docker &> /dev/null; then
    echo "Docker not found in WSL. Options:"
    echo "  A) Install Docker Desktop for Windows with WSL2 backend (recommended)"
    echo "  B) Install Docker natively in WSL2"
    echo ""
    read -p "Install Docker natively in WSL2? (y/N): " INSTALL_DOCKER
    if [[ "$INSTALL_DOCKER" =~ ^[Yy]$ ]]; then
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker $USER
        echo "Docker installed. Log out and back in for group changes."
    fi
fi

# ---- 2. Install pnpm ----
if ! command -v pnpm &> /dev/null; then
    echo "[2/5] Installing pnpm..."
    corepack enable
    corepack prepare pnpm@latest --activate
else
    echo "[2/5] pnpm already installed."
fi

# ---- 3. Install Node 20+ ----
if command -v node &> /dev/null; then
    NODE_VER=$(node -v | cut -d'.' -f1 | tr -d 'v')
    if [ "$NODE_VER" -lt 20 ]; then
        echo "[3/5] Node.js < 20 detected. Installing via nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
        source ~/.bashrc
        nvm install 20
        nvm use 20
    else
        echo "[3/5] Node.js $(node -v) OK."
    fi
fi

# ---- 4. Generate keys ----
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ ! -f "$PROJECT_ROOT/keys/private.pem" ]; then
    echo "[4/5] Generating RSA keys..."
    mkdir -p "$PROJECT_ROOT/keys"
    openssl genrsa -out "$PROJECT_ROOT/keys/private.pem" 2048
    openssl rsa -in "$PROJECT_ROOT/keys/private.pem" -pubout -out "$PROJECT_ROOT/keys/public.pem"
else
    echo "[4/5] RSA keys already exist."
fi

# ---- 5. Install deps and build ----
echo "[5/5] Installing dependencies and building packages..."
cd "$PROJECT_ROOT"
pnpm install
pnpm run build:packages

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Start MongoDB via Docker:"
echo "  cd docker && docker compose -f docker-compose.dev.yml up mongo -d"
echo ""
echo "Then start all services:"
echo "  pnpm dev"
echo ""
echo "Or start everything via Docker:"
echo "  cd docker && docker compose -f docker-compose.dev.yml up"

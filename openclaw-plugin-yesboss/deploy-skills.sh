#!/usr/bin/env bash
# Deploy updated skills + src to AWS EC2 and rebuild plugin
set -e

KEY="$HOME/Downloads/awspair.pem"
HOST="ubuntu@13.49.216.57"
REMOTE_DIR="/opt/yesboss/openclaw-plugin-yesboss"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Syncing skills..."
scp -i "$KEY" -o StrictHostKeyChecking=no -r \
  "$LOCAL_DIR/skills" \
  "$HOST:$REMOTE_DIR/"

echo "==> Syncing src..."
scp -i "$KEY" -o StrictHostKeyChecking=no -r \
  "$LOCAL_DIR/src" \
  "$HOST:$REMOTE_DIR/"

echo "==> Syncing index.ts (plugin entry point)..."
scp -i "$KEY" -o StrictHostKeyChecking=no \
  "$LOCAL_DIR/index.ts" \
  "$HOST:$REMOTE_DIR/"

echo "==> Syncing VENUS_SYSTEM.md..."
scp -i "$KEY" -o StrictHostKeyChecking=no \
  "$LOCAL_DIR/VENUS_SYSTEM.md" \
  "$HOST:$REMOTE_DIR/"

echo "==> Building plugin on server..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$HOST" \
  "cd $REMOTE_DIR && npm run build"

echo "==> Restarting OpenClaw..."
ssh -i "$KEY" -o StrictHostKeyChecking=no "$HOST" \
  "systemctl --user restart openclaw-gateway && sleep 2 && systemctl --user status openclaw-gateway --no-pager"

echo "==> Done!"

#!/usr/bin/env bash
set -euo pipefail

# =============================================================
# YesBoss + OpenClaw Integration Setup
# =============================================================
# This script:
#   1. Installs OpenClaw globally
#   2. Configures the YesBoss plugin as a local extension
#   3. Sets up agent routing for WhatsApp
#   4. Starts the gateway
#   5. Triggers WhatsApp QR pairing
#
# Prerequisites:
#   - YesBoss backend running (docker compose up or pnpm dev)
#   - Node.js 20+
#   - A phone with WhatsApp for QR pairing
#
# Usage:
#   chmod +x openclaw-integration/setup-openclaw.sh
#   ./openclaw-integration/setup-openclaw.sh
# =============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OPENCLAW_DIR="$HOME/.openclaw"

echo "=== YesBoss + OpenClaw Integration Setup ==="
echo ""

# ---- 1. Install OpenClaw ----
echo "[1/6] Installing OpenClaw..."
if command -v openclaw &> /dev/null; then
    echo "  OpenClaw already installed: $(openclaw --version)"
else
    npm install -g openclaw@latest
    echo "  Installed: $(openclaw --version)"
fi

# ---- 2. Link YesBoss plugin as a local extension ----
echo "[2/6] Linking YesBoss plugin..."

# OpenClaw discovers plugins from:
#   - Built-in extensions/ directory
#   - npm packages with openclaw prefix
#   - Local directories specified in config
#
# We'll symlink our plugin into OpenClaw's extensions directory

OPENCLAW_EXT_DIR="$OPENCLAW_DIR/extensions"
mkdir -p "$OPENCLAW_EXT_DIR"

# Remove old symlink if exists
rm -f "$OPENCLAW_EXT_DIR/yesboss"

# Create symlink to our plugin
ln -s "$PROJECT_ROOT/openclaw-plugin-yesboss" "$OPENCLAW_EXT_DIR/yesboss"
echo "  Plugin linked: $OPENCLAW_EXT_DIR/yesboss -> $PROJECT_ROOT/openclaw-plugin-yesboss"

# ---- 3. Create YesBoss agent configuration ----
echo "[3/6] Configuring YesBoss agent..."

# Ensure config directory exists
mkdir -p "$OPENCLAW_DIR"

# Create the agent config that will be merged into OpenClaw's config
cat > "$OPENCLAW_DIR/yesboss-agent.yaml" << 'AGENT_EOF'
# YesBoss Agent Configuration
# This gets loaded into OpenClaw's config during setup

agents:
  list:
    - id: yesboss-agent
      name: YesBoss
      default: false
      skills:
        - yesboss-task-management
        - yesboss-project-management
        - yesboss-admin
      identity:
        name: YesBoss Assistant
        description: >
          You are the YesBoss workforce management assistant.
          You help users manage tasks and projects through WhatsApp.
          Always be concise since this is a messaging interface.
          Use bullet points for lists. Keep responses under 200 words.
          When in doubt about a user's identity, look them up first.

bindings:
  - agentId: yesboss-agent
    match:
      channel: whatsapp
AGENT_EOF

echo "  Agent config written to $OPENCLAW_DIR/yesboss-agent.yaml"

# ---- 4. Create plugin config ----
echo "[4/6] Writing plugin configuration..."

# The plugin needs YESBOSS_API_URL and YESBOSS_API_KEY
# These come from the environment or the plugin config

YESBOSS_URL="${YESBOSS_API_URL:-http://localhost:3000/api}"
YESBOSS_KEY="${YESBOSS_API_KEY:-dev-api-key}"

# Check if OpenClaw config exists and merge, otherwise create
if [ -f "$OPENCLAW_DIR/config.yaml" ]; then
    echo "  Existing OpenClaw config found. Appending YesBoss plugin config..."
    echo "" >> "$OPENCLAW_DIR/config.yaml"
    echo "# YesBoss Plugin Configuration" >> "$OPENCLAW_DIR/config.yaml"
    echo "plugins:" >> "$OPENCLAW_DIR/config.yaml"
    echo "  entries:" >> "$OPENCLAW_DIR/config.yaml"
    echo "    yesboss:" >> "$OPENCLAW_DIR/config.yaml"
    echo "      enabled: true" >> "$OPENCLAW_DIR/config.yaml"
    echo "      config:" >> "$OPENCLAW_DIR/config.yaml"
    echo "        apiUrl: $YESBOSS_URL" >> "$OPENCLAW_DIR/config.yaml"
    echo "        apiKey: $YESBOSS_KEY" >> "$OPENCLAW_DIR/config.yaml"
else
    echo "  No existing config. Creating new config..."
    cat > "$OPENCLAW_DIR/config.yaml" << CONFIG_EOF
plugins:
  entries:
    yesboss:
      enabled: true
      config:
        apiUrl: $YESBOSS_URL
        apiKey: $YESBOSS_KEY
CONFIG_EOF
fi

echo "  Plugin URL: $YESBOSS_URL"
echo "  Plugin API Key: ****${YESBOSS_KEY: -4}"

# ---- 5. Verify YesBoss backend is reachable ----
echo "[5/6] Checking YesBoss backend..."
if curl -s -f "http://localhost:3000/health" > /dev/null 2>&1; then
    echo "  YesBoss gateway is reachable at localhost:3000"
else
    echo "  WARNING: YesBoss gateway not responding at localhost:3000"
    echo "  Make sure the backend is running before testing."
    echo "  Run: make dev-docker OR pnpm dev"
fi

# ---- 6. Print next steps ----
echo ""
echo "[6/6] Setup complete!"
echo ""
echo "=== Next Steps ==="
echo ""
echo "Step 1: Run the OpenClaw onboarding wizard"
echo "  openclaw onboard"
echo ""
echo "  During onboarding:"
echo "  - Choose your AI provider (OpenAI, Anthropic, etc.)"
echo "  - When asked about channels, select WhatsApp"
echo "  - Scan the QR code with your phone"
echo ""
echo "Step 2: After onboarding, merge the YesBoss agent config"
echo "  # View current config:"
echo "  cat ~/.openclaw/config.yaml"
echo "  # Add the YesBoss agent and binding:"
echo "  cat ~/.openclaw/yesboss-agent.yaml >> ~/.openclaw/config.yaml"
echo ""
echo "Step 3: Configure WhatsApp access control"
echo "  # Edit ~/.openclaw/config.yaml and add under the whatsapp channel:"
echo "  channels:"
echo "    whatsapp:"
echo "      accounts:"
echo "        default:"
echo "          dmPolicy: allowlist"
echo "          allowFrom:"
echo "            - \"+1234567890\"  # Admin phone"
echo "            - \"+0987654321\"  # Team member"
echo "          groupPolicy: disabled"
echo ""
echo "Step 4: Restart the gateway"
echo "  openclaw gateway restart"
echo ""
echo "Step 5: Test by sending a WhatsApp message"
echo "  Send: \"Hello, what can you do?\""
echo "  Send: \"Create a task: Fix the login bug\""
echo "  Send: \"Show my tasks\""
echo ""
echo "Step 6: Map your phone number to a YesBoss user"
echo "  curl -X POST http://localhost:3000/api/auth/phone-mappings \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "    -d '{"
echo "      \"phoneE164\": \"+1234567890\","
echo "      \"userId\": \"YOUR_USER_ID\","
echo "      \"organizationId\": \"YOUR_ORG_ID\""
echo "    }'"
echo ""
echo "=== Troubleshooting ==="
echo "  openclaw doctor          # Check configuration"
echo "  openclaw gateway logs    # View gateway logs"
echo "  openclaw dashboard       # Open web dashboard"

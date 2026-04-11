#!/usr/bin/env bash
set -euo pipefail

# =============================================================
# YesBoss Database Seed Script
# =============================================================
# Creates initial org, admin user, and phone mapping.
# Run after the backend services are up.
#
# Usage:
#   chmod +x scripts/seed.sh
#   API_KEY=your-api-key PHONE="+1234567890" ./scripts/seed.sh
# =============================================================

API_URL="${API_URL:-http://localhost:3000/api}"
API_KEY="${API_KEY:-${YESBOSS_API_KEY:-dev-api-key}}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@yesboss.io}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
ADMIN_NAME="${ADMIN_NAME:-Admin User}"
PHONE="${PHONE:-+1234567890}"

echo "=== YesBoss Database Seed ==="
echo "API URL: $API_URL"
echo ""

# ---- 1. Create Organization ----
echo "[1/4] Creating organization..."
ORG_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"name\": \"$ADMIN_NAME\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "  Response: $ORG_RESPONSE"

# Extract token and user info
TOKEN=$(echo "$ORG_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo "$ORG_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
ORG_ID=$(echo "$ORG_RESPONSE" | grep -o '"organizationId":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ] || [ -z "$USER_ID" ]; then
    echo "  ERROR: Failed to create admin user."
    echo "  Response: $ORG_RESPONSE"
    echo ""
    echo "  If user already exists, try logging in:"
    echo "  curl -s -X POST $API_URL/auth/login -H 'Content-Type: application/json' \\"
    echo "    -d '{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}'"
    exit 1
fi

echo "  Admin user ID: $USER_ID"
echo "  Token: ${TOKEN:0:20}..."

# ---- 2. Create default project ----
echo ""
echo "[2/4] Creating default project..."
PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/workforce/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"General\",
    \"description\": \"Default project for general tasks\"
  }")

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "  Project ID: $PROJECT_ID"

# ---- 3. Create sample tasks ----
echo ""
echo "[3/4] Creating sample tasks..."

TASK1=$(curl -s -X POST "$API_URL/workforce/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Set up development environment\",
    \"description\": \"Install Node.js, Docker, and configure WSL2\",
    \"priority\": \"high\",
    \"projectId\": \"$PROJECT_ID\"
  }")
echo "  Task 1: Set up development environment"

TASK2=$(curl -s -X POST "$API_URL/workforce/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Configure OpenClaw WhatsApp integration\",
    \"description\": \"Install OpenClaw, pair WhatsApp, test messaging\",
    \"priority\": \"high\",
    \"projectId\": \"$PROJECT_ID\"
  }")
echo "  Task 2: Configure OpenClaw WhatsApp integration"

TASK3=$(curl -s -X POST "$API_URL/workforce/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"Design frontend dashboard\",
    \"description\": \"Create React dashboard for task and project management\",
    \"priority\": \"medium\",
    \"projectId\": \"$PROJECT_ID\"
  }")
echo "  Task 3: Design frontend dashboard"

# ---- 4. Map phone number to admin user ----
echo ""
echo "[4/4] Mapping phone number to admin user..."
PHONE_RESPONSE=$(curl -s -X POST "$API_URL/auth/phone-mappings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"phoneE164\": \"$PHONE\",
    \"userId\": \"$USER_ID\"
  }")

echo "  Phone $PHONE -> User $USER_ID"

# ---- Summary ----
echo ""
echo "=== Seed Complete ==="
echo ""
echo "Admin credentials:"
echo "  Email:    $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASSWORD"
echo "  User ID:  $USER_ID"
echo "  Phone:    $PHONE"
echo ""
echo "Project: General ($PROJECT_ID)"
echo "Tasks created: 3"
echo ""
echo "JWT Token (save for testing):"
echo "  $TOKEN"
echo ""
echo "Test WhatsApp flow:"
echo "  1. Make sure OpenClaw is configured (see openclaw-integration/)"
echo "  2. Send a WhatsApp message to the paired number"
echo "  3. Try: 'show my tasks' or 'create task: test WhatsApp flow'"

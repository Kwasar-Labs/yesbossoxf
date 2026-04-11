# YesBoss Backend - Makefile
# Common commands for development and deployment

.PHONY: help dev dev-docker build build-packages clean deploy setup-wsl \
        seed setup-openclaw test-api

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ---- Development ----

dev: ## Start all services locally (auto-starts MongoDB if needed)
	@node -e "const http=require('http');const r=http.get('http://localhost:27017',()=>{process.exit(0)});r.on('error',()=>{process.exit(1)});setTimeout(()=>process.exit(1),2000)" 2>/dev/null || (echo "Starting MongoDB..." && mkdir -p .mongodb/data && .mongodb/mongodb-win32-x86_64-windows-8.0.9/bin/mongod.exe --dbpath .mongodb/data --port 27017 --logpath .mongodb/mongod.log &)
	pnpm -w run dev

dev-web: ## Start web frontend only
	cd apps/web && pnpm dev

dev-docker: ## Start all services via Docker Compose (dev mode)
	cd docker && docker compose -f docker-compose.dev.yml up --build

dev-mongo: ## Start only MongoDB via Docker
	cd docker && docker compose -f docker-compose.dev.yml up mongo -d

dev-stop: ## Stop dev Docker Compose
	cd docker && docker compose -f docker-compose.dev.yml down

# ---- Build ----

build: ## Build shared packages + all apps
	pnpm run build

build-packages: ## Build shared packages only
	pnpm run build:packages

# ---- Database ----

seed: ## Seed DB with org, admin user, sample tasks, phone mapping
	@echo "Seeding database..."
	@chmod +x scripts/seed.sh
	PHONE="${PHONE:-+1234567890}" bash scripts/seed.sh

# ---- OpenClaw ----

setup-openclaw: ## Install OpenClaw, link plugin, configure agent
	@echo "Setting up OpenClaw integration..."
	@chmod +x openclaw-integration/setup-openclaw.sh
	bash openclaw-integration/setup-openclaw.sh

openclaw-config: ## Print the config to merge into ~/.openclaw/config.yaml
	@echo "Add this to your ~/.openclaw/config.yaml after running openclaw onboard:"
	@echo ""
	@cat openclaw-integration/yesboss-plugin-config.yaml

# ---- Testing ----

test-api: ## Quick smoke test of all API endpoints (requires running backend)
	@echo "Testing API endpoints..."
	@echo -n "  Health check: " && curl -s http://localhost:3000/health | head -1 || echo "FAIL"
	@echo ""

# ---- Production ----

deploy: ## Deploy to Oracle Cloud VM (run from VM)
	cd deploy && bash deploy.sh

deploy-build: ## Build production Docker images
	cd docker && docker compose -f docker-compose.yml build

deploy-up: ## Start production Docker Compose
	cd docker && docker compose -f docker-compose.yml up -d

deploy-down: ## Stop production Docker Compose
	cd docker && docker compose -f docker-compose.yml down

deploy-logs: ## Tail production logs
	cd docker && docker compose -f docker-compose.yml logs -f

# ---- Setup ----

setup-wsl: ## Set up development environment on WSL2
	cd deploy && bash setup-wsl.sh

generate-keys: ## Generate RSA key pair for JWT
	mkdir -p keys
	openssl genrsa -out keys/private.pem 2048
	openssl rsa -in keys/private.pem -pubout -out keys/public.pem
	@echo "Keys generated in keys/"

# ---- Cleanup ----

clean: ## Remove all build artifacts
	find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "Cleaned."

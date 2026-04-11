# ---- Stage 1: Build shared packages ----
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/

# Install deps and build packages
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter @yesboss/types build && \
    pnpm run --filter @yesboss/errors build && \
    pnpm run --filter @yesboss/utils build

# ---- Stage 2: Build auth service ----
FROM builder AS auth-builder

COPY apps/auth/ ./apps/auth/
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter @yesboss/auth build

# ---- Stage 3: Production image ----
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy built packages
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/ ./packages/

# Copy built auth app
COPY --from=auth-builder /app/apps/auth/ ./apps/auth/

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Generate JWT keys at build time (override in production with mounted keys)
RUN mkdir -p /app/keys

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "apps/auth/dist/index.js"]

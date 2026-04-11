# YesBoss Web Frontend - Multi-stage Dockerfile
# Next.js 16 production build

# ---- Stage 1: Install dependencies ----
FROM node:20-slim AS base
RUN corepack enable
WORKDIR /app

# ---- Stage 2: Build ----
FROM base AS builder

# Copy workspace root config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/types/package.json packages/types/package.json
COPY packages/types packages/types
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile

# Build shared packages first
RUN pnpm --filter @yesboss/types build

# Copy web app source
COPY apps/web apps/web

# Build arguments for env vars
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ARG NEXT_PUBLIC_OPENCLAW_URL=http://localhost:4000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_OPENCLAW_URL=$NEXT_PUBLIC_OPENCLAW_URL

RUN pnpm --filter @yesboss/web build

# ---- Stage 3: Production ----
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

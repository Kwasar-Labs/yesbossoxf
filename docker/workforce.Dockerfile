# ---- Stage 1: Build shared packages ----
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile
RUN pnpm run --filter @yesboss/types build && \
    pnpm run --filter @yesboss/errors build && \
    pnpm run --filter @yesboss/utils build

# ---- Stage 2: Build workforce service ----
FROM builder AS workforce-builder

COPY apps/workforce/ ./apps/workforce/
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter @yesboss/workforce build

# ---- Stage 3: Production image ----
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/ ./packages/

COPY --from=workforce-builder /app/apps/workforce/ ./apps/workforce/

RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "apps/workforce/dist/index.js"]

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

# ---- Stage 2: Build communication service ----
FROM builder AS communication-builder

COPY apps/communication/ ./apps/communication/
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter @yesboss/communication build

# ---- Stage 3: Production image ----
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/ ./packages/

COPY --from=communication-builder /app/apps/communication/ ./apps/communication/

RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "apps/communication/dist/index.js"]

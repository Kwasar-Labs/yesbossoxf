FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY apps/dev-gateway/ ./apps/dev-gateway/
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/dev-gateway/node_modules/.bin/tsx", "apps/dev-gateway/src/index.ts"]

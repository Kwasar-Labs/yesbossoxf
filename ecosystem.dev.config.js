// Development PM2 config — tsx --watch hot reload
// Usage: pm2 start ecosystem.dev.config.js
// View logs: pm2 logs
// Stop all: pm2 delete all
//
// Prerequisites: MongoDB running (docker compose up mongo -d)

module.exports = {
  apps: [
    {
      name: "yesboss-auth",
      script: "./node_modules/.bin/tsx.cmd",
      args: "--watch apps/auth/src/index.ts",
      env: {
        AUTH_PORT: 3001,
        MONGO_URI: "mongodb://localhost:27017/yesboss",
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      min_uptime: 3000,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "yesboss-workforce",
      script: "./node_modules/.bin/tsx.cmd",
      args: "--watch apps/workforce/src/index.ts",
      env: {
        WORKFORCE_PORT: 3002,
        MONGO_URI: "mongodb://localhost:27017/yesboss",
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      min_uptime: 3000,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "yesboss-communication",
      script: "./node_modules/.bin/tsx.cmd",
      args: "--watch apps/communication/src/index.ts",
      env: {
        COMMUNICATION_PORT: 4000,
        MONGO_URI: "mongodb://localhost:27017/yesboss",
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      min_uptime: 3000,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "yesboss-gateway",
      script: "./node_modules/.bin/tsx.cmd",
      args: "--watch apps/dev-gateway/src/index.ts",
      env: {
        GATEWAY_PORT: 3000,
        AUTH_PORT: 3001,
        WORKFORCE_PORT: 3002,
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "150M",
      min_uptime: 3000,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "yesboss-web",
      script: "./node_modules/.bin/pnpm.cmd",
      args: "--filter @yesboss/web dev",
      env: {
        NODE_ENV: "development",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      min_uptime: 5000,
      max_restarts: 5,
      restart_delay: 3000,
    },
    {
      // OpenClaw gateway — WhatsApp + agent routing
      name: "openclaw",
      script: "cmd.exe",
      args: "/c openclaw.cmd gateway start",
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      min_uptime: 5000,
      max_restarts: 5,
      restart_delay: 5000,
    },
  ],
};

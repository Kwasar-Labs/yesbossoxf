// Production PM2 config — built dist/ files
// Usage: pm2 start ecosystem.config.js
// Auto-start on boot: pm2 startup && pm2 save

module.exports = {
  apps: [
    {
      name: "yesboss-auth",
      script: "./apps/auth/dist/index.js",
      env: {
        AUTH_PORT: 3001,
        MONGO_URI: "mongodb://localhost:27017/yesboss",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
    },
    {
      name: "yesboss-workforce",
      script: "./apps/workforce/dist/index.js",
      env: {
        WORKFORCE_PORT: 3002,
        MONGO_URI: "mongodb://localhost:27017/yesboss",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
    },
    {
      name: "yesboss-communication",
      script: "./apps/communication/dist/index.js",
      env: {
        COMMUNICATION_PORT: 4000,
        MONGO_URI: "mongodb://localhost:27017/yesboss",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
    },
    {
      name: "yesboss-gateway",
      script: "./apps/dev-gateway/dist/index.js",
      env: {
        GATEWAY_PORT: 3000,
        AUTH_PORT: 3001,
        WORKFORCE_PORT: 3002,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "100M",
    }
  ],
};

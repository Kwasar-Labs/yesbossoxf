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
      name: "yesboss-gateway",
      script: "./apps/dev-gateway/dist/index.js",
      env: {
        GATEWAY_PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "100M",
    },
  ],
};

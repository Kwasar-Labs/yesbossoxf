import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const PORT = parseInt(process.env.GATEWAY_PORT || "3000", 10);
const AUTH_PORT = parseInt(process.env.AUTH_PORT || "3001", 10);
const WORKFORCE_PORT = parseInt(process.env.WORKFORCE_PORT || "3002", 10);

const app = express();

app.use(cors());

app.use(
  "/api",
  createProxyMiddleware({
    // The target here is just a default placeholder
    target: `http://localhost:${AUTH_PORT}`,
    changeOrigin: true,
    pathRewrite: function (path, req) {
      if (path.startsWith("/workforce")) return path.replace("/workforce", "");
      if (path.startsWith("/chat") || path.startsWith("/communication")) return "/api" + path;
      return path;
    },
    onProxyReq: (proxyReq, req, res) => { console.log('[Gateway] proxying ', req.method, req.originalUrl, 'to', proxyReq.path); },
    router: function (req) {
      if (req.url.startsWith("/workforce") || req.url.startsWith("/tasks") || req.url.startsWith("/projects") || req.url.startsWith("/assignments")) {
        return `http://localhost:${WORKFORCE_PORT}`;
      }
      if (req.url.startsWith("/chat") || req.url.startsWith("/communication")) {
        return `http://localhost:4000`;
      }
      return `http://localhost:${AUTH_PORT}`;
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", services: { auth: AUTH_PORT, workforce: WORKFORCE_PORT } });
});

app.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT} → auth:${AUTH_PORT}, workforce:${WORKFORCE_PORT}`);
});

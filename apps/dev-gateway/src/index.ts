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
    target: `http://127.0.0.1:${AUTH_PORT}`,
    changeOrigin: true,
    proxyTimeout: 120000,
    timeout: 120000,
    pathRewrite: function (path, _req) {
      if (path.startsWith("/workforce")) return path.replace("/workforce", "");
      if (path.startsWith("/chat") || path.startsWith("/communication")) return "/api" + path;
      return path;
    },
    router: function (req) {
      if (
        req.url.startsWith("/workforce") ||
        req.url.startsWith("/tasks") ||
        req.url.startsWith("/projects") ||
        req.url.startsWith("/assignments")
      ) {
        return `http://127.0.0.1:${WORKFORCE_PORT}`;
      }
      if (req.url.startsWith("/chat") || req.url.startsWith("/communication")) {
        return `http://127.0.0.1:4000`;
      }
      return `http://127.0.0.1:${AUTH_PORT}`;
    },
    on: {
      proxyReq: (proxyReq, req) => {
        console.log(`[Gateway] ${req.method} ${req.originalUrl} → ${proxyReq.host}${proxyReq.path}`);
      },
      error: (err, req, res) => {
        const code = (err as NodeJS.ErrnoException).code;
        console.error(`[Gateway] proxy error ${code}: ${req.method} ${(req as express.Request).originalUrl}`);
        if (!res.headersSent) {
          (res as express.Response).status(503).json({
            error: {
              code: code ?? "SERVICE_UNAVAILABLE",
              message: "Service temporarily unavailable — backend may still be starting",
            },
          });
        }
      },
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", services: { auth: AUTH_PORT, workforce: WORKFORCE_PORT } });
});

app.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT} → auth:${AUTH_PORT}, workforce:${WORKFORCE_PORT}`);
});

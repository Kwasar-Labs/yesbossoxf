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
app.use(express.json());

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: `http://localhost:${AUTH_PORT}`,
    changeOrigin: true,
  }),
);

app.use(
  "/api/workforce",
  createProxyMiddleware({
    target: `http://localhost:${WORKFORCE_PORT}`,
    changeOrigin: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", services: { auth: AUTH_PORT, workforce: WORKFORCE_PORT } });
});

app.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT} → auth:${AUTH_PORT}, workforce:${WORKFORCE_PORT}`);
});

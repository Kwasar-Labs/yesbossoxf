import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, "../../../..");

dotenv.config({ path: path.join(monorepoRoot, ".env") });

function resolveKey(envVar: string | undefined, fallback: string): string {
  const raw = envVar || fallback;
  return path.isAbsolute(raw) ? raw : path.resolve(monorepoRoot, raw);
}

export const env = {
  PORT: parseInt(process.env.COMMUNICATION_PORT || "4000", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/yesboss",
  JWT_PUBLIC_KEY_PATH: resolveKey(process.env.JWT_PUBLIC_KEY_PATH, "./keys/public.pem"),
  YESBOSS_API_KEY: process.env.YESBOSS_API_KEY || "",
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  WORKFORCE_SERVICE_URL: process.env.WORKFORCE_SERVICE_URL || "http://localhost:3002",
  OPENCLAW_GATEWAY_URL: process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18790",
  OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || "0230b8c7ee27846992bb9fc068db3e0b0441bcd061d9f65b",
};

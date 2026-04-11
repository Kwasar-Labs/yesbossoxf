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
  PORT: parseInt(process.env.WORKFORCE_PORT || "3002", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/yesboss",
  JWT_PUBLIC_KEY_PATH: resolveKey(process.env.JWT_PUBLIC_KEY_PATH, "./keys/public.pem"),
  YESBOSS_API_KEY: process.env.YESBOSS_API_KEY || "",
};

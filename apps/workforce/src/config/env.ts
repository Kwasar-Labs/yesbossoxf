import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.WORKFORCE_PORT || "3002", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/yesboss",
  JWT_PUBLIC_KEY_PATH: process.env.JWT_PUBLIC_KEY_PATH || "./keys/public.pem",
  YESBOSS_API_KEY: process.env.YESBOSS_API_KEY || "",
};

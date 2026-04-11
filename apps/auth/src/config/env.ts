import dotenv from "dotenv";
import path from "path";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.AUTH_PORT || "3001", 10),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/yesboss",      
  JWT_PRIVATE_KEY_PATH: process.env.JWT_PRIVATE_KEY_PATH || path.resolve(process.cwd(), "../../keys/private.pem"),
  JWT_PUBLIC_KEY_PATH: process.env.JWT_PUBLIC_KEY_PATH || path.resolve(process.cwd(), "../../keys/public.pem"),  
};

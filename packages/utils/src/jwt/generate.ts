import fs from "node:fs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@yesboss/types";

export function generateToken(payload: JwtPayload, privateKeyPath: string): string {
  const privateKey = fs.readFileSync(privateKeyPath, "utf-8");
  return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn: "24h" });
}

import fs from "node:fs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "@yesboss/types";

export function verifyToken(token: string, publicKeyPath: string): JwtPayload {
  const publicKey = fs.readFileSync(publicKeyPath, "utf-8");
  return jwt.verify(token, publicKey, { algorithms: ["RS256"] }) as JwtPayload;
}

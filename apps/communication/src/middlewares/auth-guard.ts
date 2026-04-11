import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@yesboss/utils";
import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

export function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" } });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token, env.JWT_PUBLIC_KEY_PATH);
    req.user = payload as AuthenticatedRequest["user"];
    next();
  } catch {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
}

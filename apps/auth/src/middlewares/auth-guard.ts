import type { Request, Response, NextFunction } from "express";
import { HttpError } from "@yesboss/errors";
import { verifyToken } from "@yesboss/utils";
import type { JwtPayload } from "@yesboss/types";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw HttpError.unauthorized("Missing or invalid Authorization header");
  }

  try {
    const token = header.slice(7);
    req.user = verifyToken(token, env.JWT_PUBLIC_KEY_PATH);
    next();
  } catch {
    throw HttpError.unauthorized("Invalid or expired token");
  }
}

export function apiKeyGuard(req: Request, _res: Response, next: NextFunction): void {
  const key = req.headers["x-yesboss-api-key"];
  if (!key || key !== env.YESBOSS_API_KEY) {
    throw HttpError.unauthorized("Invalid API key");
  }
  next();
}

/** Accept either Bearer JWT or API key */
export function dualAuth(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.headers["x-yesboss-api-key"];
  if (apiKey && apiKey === env.YESBOSS_API_KEY) {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const token = header.slice(7);
      req.user = verifyToken(token, env.JWT_PUBLIC_KEY_PATH);
      next();
      return;
    } catch {
      throw HttpError.unauthorized("Invalid or expired token");
    }
  }

  throw HttpError.unauthorized("Authentication required");
}

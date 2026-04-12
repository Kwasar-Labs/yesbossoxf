import type { Request, Response, NextFunction } from "express";
import { HttpError } from "./http-error.js";

export function httpErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err && err.name === "HttpError") {
    const httpErr = err as any;
    res.status(httpErr.statusCode || 500).json({
      error: {
        code: httpErr.code || "INTERNAL_ERROR",
        message: httpErr.message,
        ...(httpErr.details ? { details: httpErr.details } : {}),
      },
    });
    return;
  }

  console.error("[Unhandled Error]", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}

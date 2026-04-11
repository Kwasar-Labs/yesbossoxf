import type { Request } from "express";

/** Safely extract a string route param (Express 5 types params as string | string[]) */
export function param(req: Request, key: string): string {
  const val = req.params[key];
  return typeof val === "string" ? val : String(val);
}

/** Safely extract a string query param */
export function query(req: Request, key: string): string | undefined {
  const val = req.query[key];
  return typeof val === "string" ? val : undefined;
}

/**
 * HTTP client for calling YesBoss REST API endpoints.
 * Uses service-to-service API key authentication.
 */

import { resolveApiUrl, resolveApiKey } from "./config.js";

export type YesBossErrorCode =
  | "RATE_LIMIT"
  | "AUTH_ERROR"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT";

export class YesBossApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: YesBossErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "YesBossApiError";
  }
}

function classifyStatus(status: number): YesBossErrorCode {
  if (status === 429) return "RATE_LIMIT";
  if (status === 401 || status === 403) return "AUTH_ERROR";
  if (status === 404) return "NOT_FOUND";
  return "SERVER_ERROR";
}

const REQUEST_TIMEOUT_MS = 10_000;

export async function callYesBossApi(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  pluginConfig?: { apiUrl?: string; apiKey?: string },
): Promise<Record<string, unknown>> {
  const baseUrl = resolveApiUrl(pluginConfig);
  const apiKey = resolveApiKey(pluginConfig);
  const url = `${baseUrl}${path}`;

  console.log(`[yesboss-plugin] ${method} ${url}`);

  // Abort after REQUEST_TIMEOUT_MS to avoid indefinite hangs
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-YesBoss-API-Key": apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === "AbortError";
    const code: YesBossErrorCode = isAbort ? "TIMEOUT" : "NETWORK_ERROR";
    const msg = isAbort
      ? `Request timed out after ${REQUEST_TIMEOUT_MS}ms`
      : `Network error: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`[yesboss-plugin] ${code}:`, msg);
    throw new YesBossApiError(0, code, msg);
  }
  clearTimeout(timer);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    const msg = (errorBody as { message?: string }).message || JSON.stringify(errorBody);
    const code = classifyStatus(response.status);
    console.error(`[yesboss-plugin] ${code} ${response.status}:`, msg);
    throw new YesBossApiError(response.status, code, msg);
  }

  // 204 No Content
  if (response.status === 204) return { success: true };

  const json = (await response.json()) as Record<string, unknown>;
  console.log(`[yesboss-plugin] Response:`, JSON.stringify(json).substring(0, 500));
  return json;
}

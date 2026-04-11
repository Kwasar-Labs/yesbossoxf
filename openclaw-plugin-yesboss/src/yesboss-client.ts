/**
 * HTTP client for calling YesBoss REST API endpoints.
 * Uses service-to-service API key authentication.
 */

import { resolveApiUrl, resolveApiKey } from "./config.js";

export async function callYesBossApi(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  pluginConfig?: { apiUrl?: string; apiKey?: string },
): Promise<Record<string, unknown>> {
  const baseUrl = resolveApiUrl(pluginConfig);
  const apiKey = resolveApiKey(pluginConfig);

  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-YesBoss-API-Key": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(`YesBoss API error: ${response.status} - ${(error as any).message || JSON.stringify(error)}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return { success: true };

  return response.json() as Promise<Record<string, unknown>>;
}

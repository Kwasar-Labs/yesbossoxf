/**
 * Helper to format tool results in OpenClaw MCP-compatible format.
 * OpenClaw expects: { content: [{ type: "text", text: "..." }], details: {...} }
 */

import { YesBossApiError } from "./yesboss-client.js";

export function toolResult(data: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    details: data,
  };
}

export function toolError(message: string, code?: string) {
  const tag = code ? `[${code}] ` : "";
  return {
    content: [{ type: "text" as const, text: `Error: ${tag}${message}` }],
    isError: true,
    errorCode: code,
  };
}

/**
 * Converts any thrown error into a toolError response.
 * Preserves YesBossApiError codes so skills can apply the correct graceful reply.
 */
export function toolErrorFromThrown(err: unknown): ReturnType<typeof toolError> {
  if (err instanceof YesBossApiError) {
    return toolError(err.message, err.code);
  }
  const message = err instanceof Error ? err.message : String(err);
  return toolError(message);
}

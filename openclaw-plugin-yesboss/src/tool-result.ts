/**
 * Helper to format tool results in OpenClaw MCP-compatible format.
 * OpenClaw expects: { content: [{ type: "text", text: "..." }], details: {...} }
 */

export function toolResult(data: Record<string, unknown>) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    details: data,
  };
}

export function toolError(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

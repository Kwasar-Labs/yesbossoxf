import { env } from "../config/env.js";
import { createLogger } from "@yesboss/utils";

const log = createLogger("openclaw");

export interface OpenClawMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenClawRequest {
  model: string;
  messages: OpenClawMessage[];
  stream?: boolean;
  temperature?: number;
}

interface OpenClawResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function sendToOpenClaw(
  messages: OpenClawMessage[],
  agentId: string = "yesboss-agent"
): Promise<string> {
  const payload: OpenClawRequest = {
    model: `openclaw:${agentId}`,
    messages,
    stream: false,
    temperature: 0.7,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);

    const response = await fetch(
      `${env.OPENCLAW_GATEWAY_URL}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENCLAW_GATEWAY_TOKEN}`,
          "x-openclaw-agent-id": agentId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      log.error(`OpenClaw error (${response.status}):`, error);
      throw new Error(`OpenClaw returned ${response.status}: ${error}`);
    }

    const data = (await response.json()) as OpenClawResponse;
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No message content in OpenClaw response");
    }

    return assistantMessage;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log.error("Failed to call OpenClaw:", msg);
    throw error;
  }
}

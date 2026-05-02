/**
 * Outbound WhatsApp messaging tool.
 * Shells out to `openclaw message send` which runs in the same host process context.
 */
import { Type } from "@sinclair/typebox";
import { execSync } from "child_process";
import { toolResult } from "../tool-result.js";

const SendWaMessageSchema = Type.Object(
  {
    phone_e164: Type.String({
      description: "Recipient phone in E.164 format (e.g. +917620000007)",
    }),
    message: Type.String({ description: "Message text to send" }),
  },
);

export function createSendWaMessageTool(_config?: unknown) {
  return {
    name: "yesboss_send_wa_message",
    label: "Send WhatsApp Message",
    description:
      "Send a WhatsApp message to a team member proactively. Use when Dr. Gurbeer asks you to message someone, or when a notification/update needs to go out to a specific phone number.",
    parameters: SendWaMessageSchema,
    execute: async (
      _toolCallId: string,
      rawParams: { phone_e164: string; message: string },
    ) => {
      try {
        const phone = rawParams.phone_e164.replace(/[^+\d]/g, "");
        // Single-quote-safe escape: replace ' with '\''
        const escapedMsg = rawParams.message.replace(/'/g, "'\\''");
        const stdout = execSync(
          `openclaw message send --channel whatsapp --target '${phone}' --message '${escapedMsg}' --json`,
          { encoding: "utf8", timeout: 15000 },
        );
        // stdout contains plugin log lines before the JSON object — find the start of
        // the multi-line JSON block (a line consisting solely of "{") and parse from there.
        const lines = stdout.split("\n");
        const startIdx = lines.findIndex((l) => l.trim() === "{");
        const jsonText = startIdx >= 0 ? lines.slice(startIdx).join("\n") : stdout;
        const data = JSON.parse(jsonText);
        return toolResult({
          sent: true,
          messageId: data?.payload?.result?.messageId ?? null,
          to: phone,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return toolResult({ sent: false, error: msg });
      }
    },
  };
}

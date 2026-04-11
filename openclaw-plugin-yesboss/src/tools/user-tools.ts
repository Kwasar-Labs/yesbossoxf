/**
 * User lookup tool — resolves a phone number to a YesBoss user.
 * Used by other tools internally, but also exposed for the agent to query user info.
 */

import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";

const LookupUserSchema = Type.Object({
  phone_e164: Type.String({ description: "Phone number in E.164 format (e.g., +1234567890)" }),
}, { additionalProperties: false });

export function createLookupUserTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_lookup_user",
    label: "Lookup User by Phone",
    description: "Look up a YesBoss user by their WhatsApp phone number. Returns user ID, name, role, and organization.",
    parameters: LookupUserSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const result = await callYesBossApi(
        "GET",
        `/auth/phone-mappings/${encodeURIComponent(rawParams.phone_e164 as string)}`,
        undefined,
        config,
      );
      return { type: "json" as const, value: result };
    },
  };
}

/**
 * User lookup tool — resolves a phone number to a YesBoss user.
 * Used by other tools internally, but also exposed for the agent to query user info.
 */

import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

const LookupUserSchema = Type.Object({
  phone_e164: Type.String({ description: "Phone number in E.164 format (e.g., +1234567890)" }),
});

export function createLookupUserTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_lookup_user",
    label: "Lookup User by Phone",
    description: "Look up a YesBoss user by their WhatsApp phone number. Returns user_id, organization_id, name, email, and role.",
    parameters: LookupUserSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi(
          "GET",
          `/auth/phone-mappings/${encodeURIComponent(rawParams.phone_e164 as string)}`,
          undefined,
          config,
        );
        // Flatten the nested response for easy extraction by the LLM
        const data = (result as any)?.data || result;
        const user = data?.user || {};
        const mapping = data?.mapping || {};
        return toolResult({
          user_id: user.id || mapping.userId || null,
          organization_id: user.organizationId || mapping.organizationId || null,
          name: user.name || null,
          email: user.email || null,
          role: user.role || null,
          phone: mapping.phoneE164 || rawParams.phone_e164,
        });
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

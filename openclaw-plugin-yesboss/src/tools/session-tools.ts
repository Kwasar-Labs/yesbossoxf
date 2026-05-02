import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

// --- Get session ---
const GetSessionSchema = Type.Object({
  phone_e164: Type.String({ description: "Phone in E.164 format." }),
});

export function createGetSessionTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_get_session",
    label: "Get Session",
    description:
      "Get the WhatsApp conversation session for this phone: last N turns, activeIntent, pendingConfirmation. Call at the START of every turn to resolve pronouns and check mid-flow state.",
    parameters: GetSessionSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const url = `/workforce/sessions/${encodeURIComponent(String(raw.phone_e164))}`;
        const result = await callYesBossApi("GET", url, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Append turn ---
const TurnSchema = Type.Object({
  role: Type.Union([Type.Literal("user"), Type.Literal("assistant"), Type.Literal("system"), Type.Literal("tool")]),
  content: Type.String(),
  toolCalls: Type.Optional(Type.Array(Type.Object({
    name: Type.String(),
    args: Type.Record(Type.String(), Type.Unknown()),
    result: Type.Optional(Type.Unknown()),
  }))),
  timestamp: Type.Optional(Type.String({ description: "ISO date. Defaults to now." })),
});

const AppendTurnSchema = Type.Object({
  phone_e164: Type.String(),
  user_id: Type.Optional(Type.String()),
  organization_id: Type.Optional(Type.String()),
  turn: TurnSchema,
  active_intent: Type.Optional(Type.Union([
    Type.Null(),
    Type.Object({
      name: Type.String(),
      collected: Type.Record(Type.String(), Type.Unknown()),
      missing: Type.Array(Type.String()),
      startedAt: Type.Optional(Type.String()),
    }),
  ], { description: "Set new intent, pass null to clear, omit to leave alone." })),
  pending_confirmation: Type.Optional(Type.Union([
    Type.Null(),
    Type.Object({
      action: Type.String(),
      params: Type.Record(Type.String(), Type.Unknown()),
      promptedAt: Type.Optional(Type.String()),
    }),
  ], { description: "Set, pass null to clear, omit to leave alone." })),
});

export function createAppendTurnTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_append_turn",
    label: "Append Turn",
    description:
      "Append a turn to the WhatsApp conversation session. Use to record user/assistant messages, tool calls, and update intent / confirmation state. TTL refreshes on each append.",
    parameters: AppendTurnSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const turn = raw.turn as Record<string, unknown>;
        const body: Record<string, unknown> = {
          phoneE164: raw.phone_e164,
          turn: {
            role: turn.role,
            content: turn.content,
            toolCalls: turn.toolCalls,
            timestamp: turn.timestamp ? new Date(String(turn.timestamp)) : new Date(),
          },
        };
        if (raw.user_id) body.userId = raw.user_id;
        if (raw.organization_id) body.organizationId = raw.organization_id;
        if (raw.active_intent !== undefined) {
          body.activeIntent = raw.active_intent === null ? null : raw.active_intent;
        }
        if (raw.pending_confirmation !== undefined) {
          body.pendingConfirmation = raw.pending_confirmation === null ? null : raw.pending_confirmation;
        }
        const result = await callYesBossApi("POST", "/workforce/sessions/turn", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Set intent ---
const SetIntentSchema = Type.Object({
  phone_e164: Type.String(),
  intent: Type.Union([
    Type.Null(),
    Type.Object({
      name: Type.String(),
      collected: Type.Record(Type.String(), Type.Unknown()),
      missing: Type.Array(Type.String()),
    }),
  ]),
});

export function createSetIntentTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_set_intent",
    label: "Set Active Intent",
    description: "Set or clear the active multi-turn intent for this session. Pass null to clear.",
    parameters: SetIntentSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = { phoneE164: raw.phone_e164 };
        if (raw.intent === null) body.intent = null;
        else {
          const i = raw.intent as any;
          body.intent = { name: i.name, collected: i.collected, missing: i.missing, startedAt: new Date() };
        }
        const result = await callYesBossApi("POST", "/workforce/sessions/intent", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Set confirmation ---
const SetConfirmationSchema = Type.Object({
  phone_e164: Type.String(),
  pending: Type.Union([
    Type.Null(),
    Type.Object({
      action: Type.String(),
      params: Type.Record(Type.String(), Type.Unknown()),
    }),
  ]),
});

export function createSetConfirmationTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_set_confirmation",
    label: "Set Pending Confirmation",
    description: "Store or clear pending destructive-op confirmation. Pass null to clear (after user YES or cancel).",
    parameters: SetConfirmationSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = { phoneE164: raw.phone_e164 };
        if (raw.pending === null) body.pending = null;
        else {
          const p = raw.pending as any;
          body.pending = { action: p.action, params: p.params, promptedAt: new Date() };
        }
        const result = await callYesBossApi("POST", "/workforce/sessions/confirmation", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

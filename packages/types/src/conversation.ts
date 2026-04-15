import type { Timestamps } from "./common.js";

export type ConversationRole = "user" | "assistant" | "system" | "tool";

export interface ConversationTurn {
  role: ConversationRole;
  content: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown>; result?: unknown }>;
  timestamp: Date;
}

export interface PendingConfirmation {
  action: string; // e.g. "delete_task"
  params: Record<string, unknown>;
  promptedAt: Date;
}

export interface ActiveIntent {
  name: string; // e.g. "creating_task"
  collected: Record<string, unknown>;
  missing: string[];
  startedAt: Date;
}

export interface ConversationSession extends Timestamps {
  _id: string;
  phoneE164: string;
  userId?: string;
  organizationId?: string;
  turns: ConversationTurn[]; // rolling last N
  activeIntent?: ActiveIntent;
  pendingConfirmation?: PendingConfirmation;
  expiresAt: Date; // TTL index target
}

export interface SessionAppendInput {
  phoneE164: string;
  userId?: string;
  organizationId?: string;
  turn: ConversationTurn;
  activeIntent?: ActiveIntent | null;
  pendingConfirmation?: PendingConfirmation | null;
  maxTurns?: number;
  ttlHours?: number;
}

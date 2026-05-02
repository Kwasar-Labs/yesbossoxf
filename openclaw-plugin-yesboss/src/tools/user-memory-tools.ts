import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

// --- Get user memory ---
const GetMemorySchema = Type.Object({
  user_id: Type.String({ description: "User ID" }),
  organization_id: Type.String({ description: "Organization ID" }),
});

export function createGetUserMemoryTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_get_user_memory",
    label: "Get User Memory",
    description:
      "Fetch per-user memory: preferences, skills, recent task/project context. Inject into prompt at turn start for personalized replies.",
    parameters: GetMemorySchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const url = `/workforce/user-memory/${encodeURIComponent(String(raw.user_id))}?organizationId=${encodeURIComponent(String(raw.organization_id))}`;
        const result = await callYesBossApi("GET", url, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Upsert user memory ---
const UpsertMemorySchema = Type.Object({
  user_id: Type.String(),
  organization_id: Type.String(),
  preferences: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: "Partial preferences to merge." })),
  notes: Type.Optional(Type.String({ description: "Freeform AI-maintained summary of the user." })),
});

export function createUpsertUserMemoryTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_set_user_memory",
    label: "Set User Memory",
    description: "Update a user's preferences or notes. Merges with existing record. Does not replace skills or recent context.",
    parameters: UpsertMemorySchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {
          userId: raw.user_id,
          organizationId: raw.organization_id,
        };
        if (raw.preferences) body.preferences = raw.preferences;
        if (raw.notes !== undefined) body.notes = raw.notes;
        const result = await callYesBossApi("POST", "/workforce/user-memory", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Push recent activity ---
const PushRecentSchema = Type.Object({
  user_id: Type.String(),
  organization_id: Type.String(),
  task_id: Type.Optional(Type.String()),
  project_id: Type.Optional(Type.String()),
});

export function createPushRecentTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_push_recent_activity",
    label: "Push Recent Activity",
    description: "Record that a user touched a task or project. Rolls into their recent context (capped 20).",
    parameters: PushRecentSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {
          userId: raw.user_id,
          organizationId: raw.organization_id,
        };
        if (raw.task_id) body.taskId = raw.task_id;
        if (raw.project_id) body.projectId = raw.project_id;
        const result = await callYesBossApi("POST", "/workforce/user-memory/recent", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Add user skill ---
const AddSkillSchema = Type.Object({
  user_id: Type.String(),
  organization_id: Type.String(),
  skill: Type.String({ description: "Skill name, e.g. 'react', 'sql', 'devops'." }),
  delta: Type.Optional(Type.Number({ description: "Confidence delta (default 0.1). Use 0.3 for strong first observation." })),
});

export function createAddUserSkillTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_add_user_skill",
    label: "Add User Skill",
    description: "Bump a user's skill confidence. Use when user demonstrates or is known for a skill. Capped at 1.0.",
    parameters: AddSkillSchema,
    execute: async (_id: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {
          userId: raw.user_id,
          organizationId: raw.organization_id,
          skill: raw.skill,
        };
        if (raw.delta !== undefined) body.delta = raw.delta;
        const result = await callYesBossApi("POST", "/workforce/user-memory/skills", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

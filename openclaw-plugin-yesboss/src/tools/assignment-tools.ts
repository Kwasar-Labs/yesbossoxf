/**
 * Assignment tools for the YesBoss OpenClaw plugin.
 */

import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

// --- Assign Task ---
const AssignTaskSchema = Type.Object({
  task_id: Type.String({ description: "Task ID" }),
  user_id: Type.String({ description: "User ID to assign the task to" }),
  organization_id: Type.String({ description: "Organization ID" }),
  confirmed: Type.Optional(Type.Boolean({ description: "Must be true to confirm reassignment" })),
});

export function createAssignTaskTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_assign_task",
    label: "Assign Task",
    description: "Assign a task to a user. If the task already has an assignee, this is a reassignment requiring confirmation. Admin only.",
    parameters: AssignTaskSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const body = {
          assigneeId: rawParams.user_id,
          organizationId: rawParams.organization_id,
        };
        const result = await callYesBossApi("POST", `/workforce/tasks/${rawParams.task_id}/assign`, body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Unassign Task ---
const UnassignTaskSchema = Type.Object({
  task_id: Type.String({ description: "Task ID" }),
});

export function createUnassignTaskTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_unassign_task",
    label: "Unassign Task",
    description: "Remove the assignee from a task. Admin only.",
    parameters: UnassignTaskSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const result = await callYesBossApi("POST", `/workforce/tasks/${rawParams.task_id}/unassign`, {}, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- List My Tasks ---
const ListMyTasksSchema = Type.Object({
  user_id: Type.String({ description: "User ID" }),
  organization_id: Type.String({ description: "Organization ID" }),
});

export function createListMyTasksTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_list_my_tasks",
    label: "List My Tasks",
    description: "List all tasks assigned to a specific user.",
    parameters: ListMyTasksSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      try {
        const params = new URLSearchParams({
          organizationId: rawParams.organization_id as string,
          assigneeId: rawParams.user_id as string,
        });
        const result = await callYesBossApi("GET", `/workforce/tasks?${params.toString()}`, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

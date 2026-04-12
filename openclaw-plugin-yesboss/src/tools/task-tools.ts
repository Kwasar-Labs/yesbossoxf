/**
 * Task management tools for the YesBoss OpenClaw plugin.
 * Each tool follows the OpenClaw AgentTool pattern:
 * { name, label, description, parameters (TypeBox), execute(toolCallId, rawParams) }
 */

import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult } from "../tool-result.js";

// --- Create Task ---
const CreateTaskSchema = Type.Object({
  title: Type.String({ description: "Task title" }),
  description: Type.Optional(Type.String({ description: "Task description" })),
  project_id: Type.Optional(Type.String({ description: "Project ID to assign task to" })),
  priority: Type.Optional(
    Type.Union([
      Type.Literal("low"), 
      Type.Literal("medium"), 
      Type.Literal("high"), 
      Type.Literal("critical")
    ], { description: "Priority: low, medium, high, critical" })
  ),
  assignee_id: Type.Optional(Type.String({ description: "User ID to assign the task to" })),
  due_date: Type.Optional(Type.String({ description: "Due date in YYYY-MM-DD format" })),
  tags: Type.Optional(Type.Array(Type.String(), { description: "Tags for the task" })),
  reminders: Type.Optional(Type.Array(Type.String(), { description: "Reminder dates (ISO 8601 strings)" })),
  recurrence_rule: Type.Optional(Type.String({ description: "RRULE string for recurring tasks" })),
  follow_up_date: Type.Optional(Type.String({ description: "Follow-up date (ISO 8601 string)" })),
  organization_id: Type.String({ description: "Organization ID" }),
}, { additionalProperties: false });

export function createCreateTaskTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_create_task",
    label: "Create Task",
    description: "Create a new task in YesBoss. Requires a title. Optionally set project, priority, assignee, due date, and tags.",
    parameters: CreateTaskSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const body: Record<string, unknown> = {
        title: rawParams.title,
        organizationId: rawParams.organization_id,
      };
      if (rawParams.description) body.description = rawParams.description;
      if (rawParams.project_id) body.projectId = rawParams.project_id;
      if (rawParams.priority) body.priority = rawParams.priority;
      if (rawParams.assignee_id) body.assigneeId = rawParams.assignee_id;
      if (rawParams.due_date) body.dueDate = rawParams.due_date;
      if (rawParams.tags) body.tags = rawParams.tags;
      if (rawParams.reminders) body.reminders = rawParams.reminders;
      if (rawParams.recurrence_rule) body.recurrenceRule = rawParams.recurrence_rule;
      if (rawParams.follow_up_date) body.followUpDate = rawParams.follow_up_date;
      const result = await callYesBossApi("POST", "/workforce/tasks", body, config);
      return toolResult(result);
    },
  };
}

// --- List Tasks ---
const ListTasksSchema = Type.Object({
  organization_id: Type.String({ description: "Organization ID" }),
  project_id: Type.Optional(Type.String({ description: "Filter by project ID" })),
  assignee_id: Type.Optional(Type.String({ description: "Filter by assignee user ID" })),
  status: Type.Optional(Type.String({ description: "Filter by status: todo, in_progress, in_review, done, cancelled" })),
  priority: Type.Optional(Type.String({ description: "Filter by priority" })),
  page: Type.Optional(Type.Number({ description: "Page number (default 1)" })),
  limit: Type.Optional(Type.Number({ description: "Results per page (default 20)" })),
}, { additionalProperties: false });

export function createListTasksTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_list_tasks",
    label: "List Tasks",
    description: "List tasks in YesBoss with optional filters. Returns paginated results.",
    parameters: ListTasksSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const params = new URLSearchParams();
      params.set("organizationId", rawParams.organization_id as string);
      if (rawParams.project_id) params.set("projectId", rawParams.project_id as string);
      if (rawParams.assignee_id) params.set("assigneeId", rawParams.assignee_id as string);
      if (rawParams.status) params.set("status", rawParams.status as string);
      if (rawParams.priority) params.set("priority", rawParams.priority as string);
      if (rawParams.page) params.set("page", String(rawParams.page));
      if (rawParams.limit) params.set("limit", String(rawParams.limit));

      const result = await callYesBossApi("GET", `/workforce/tasks?${params.toString()}`, undefined, config);
      return toolResult(result);
    },
  };
}

// --- Get Task ---
const GetTaskSchema = Type.Object({
  task_id: Type.String({ description: "Task ID" }),
}, { additionalProperties: false });

export function createGetTaskTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_get_task",
    label: "Get Task",
    description: "Get detailed information about a specific task by ID.",
    parameters: GetTaskSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const result = await callYesBossApi("GET", `/workforce/tasks/${rawParams.task_id}`, undefined, config);
      return toolResult(result);
    },
  };
}

// --- Update Task ---
const UpdateTaskSchema = Type.Object({
  task_id: Type.String({ description: "Task ID" }),
  title: Type.Optional(Type.String({ description: "New title" })),
  description: Type.Optional(Type.String({ description: "New description" })),
  priority: Type.Optional(Type.String({ description: "New priority" })),
  due_date: Type.Optional(Type.String({ description: "New due date (YYYY-MM-DD)" })),
  tags: Type.Optional(Type.Array(Type.String(), { description: "New tags" })),
  reminders: Type.Optional(Type.Array(Type.String(), { description: "New Reminder dates" })),
  recurrence_rule: Type.Optional(Type.String({ description: "New RRULE string" })),
  follow_up_date: Type.Optional(Type.String({ description: "New follow-up date" })),
}, { additionalProperties: false });

export function createUpdateTaskTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_update_task",
    label: "Update Task",
    description: "Update an existing task's fields. Only provide fields you want to change.",
    parameters: UpdateTaskSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const { task_id, ...updates } = rawParams;
      const body: Record<string, unknown> = {};
      if (updates.title) body.title = updates.title;
      if (updates.description) body.description = updates.description;
      if (updates.priority) body.priority = updates.priority;
      if (updates.due_date) body.dueDate = updates.due_date;
      if (updates.tags) body.tags = updates.tags;
      if (updates.reminders) body.reminders = updates.reminders;
      if (updates.recurrence_rule) body.recurrenceRule = updates.recurrence_rule;
      if (updates.follow_up_date) body.followUpDate = updates.follow_up_date;
      const result = await callYesBossApi("PATCH", `/workforce/tasks/${task_id}`, body, config);
      return toolResult(result);
    },
  };
}

// --- Update Task Status ---
const UpdateStatusSchema = Type.Object({
  task_id: Type.String({ description: "Task ID" }),
  status: Type.String({ description: "New status: todo, in_progress, in_review, done, cancelled" }),
}, { additionalProperties: false });

export function createUpdateTaskStatusTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_update_task_status",
    label: "Update Task Status",
    description: "Change a task's status. Valid statuses: todo, in_progress, in_review, done, cancelled.",
    parameters: UpdateStatusSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const result = await callYesBossApi(
        "PATCH",
        `/workforce/tasks/${rawParams.task_id}/status`,
        { status: rawParams.status },
        config,
      );
      return toolResult(result);
    },
  };
}

// --- Delete Task (destructive — requires confirmation) ---
const DeleteTaskSchema = Type.Object({
  task_id: Type.String({ description: "Task ID to delete" }),
  confirmed: Type.Optional(Type.Boolean({ description: "Must be true to confirm deletion" })),
}, { additionalProperties: false });

export function createDeleteTaskTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_delete_task",
    label: "Delete Task",
    description: "Delete a task permanently. This is a destructive operation — requires confirmed=true.",
    parameters: DeleteTaskSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      if (!rawParams.confirmed) {
        return toolResult({
          warning: "This is a destructive operation. Confirm with the user first by asking them to reply YES. Then call again with confirmed=true.",
          task_id: rawParams.task_id,
        });
      }

      const result = await callYesBossApi("DELETE", `/workforce/tasks/${rawParams.task_id}`, undefined, config);
      return toolResult(result);
    },
  };
}

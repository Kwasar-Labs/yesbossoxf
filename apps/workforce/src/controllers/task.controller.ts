import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok, paginated } from "@yesboss/utils";
import * as TaskRepo from "../database/task-repository.js";
import { TaskStatus, Priority } from "@yesboss/types";
import { param, query } from "../helpers.js";

function toPublic(doc: any) {
  return {
    _id: doc._id.toHexString(),
    title: doc.title,
    description: doc.description,
    projectId: doc.projectId?.toHexString(),
    status: doc.status,
    priority: doc.priority,
    assigneeId: doc.assigneeId?.toHexString(),
    subtasks: doc.subtasks,
    comments: doc.comments,
    dueDate: doc.dueDate,
    createdBy: typeof doc.createdBy === "string" ? doc.createdBy : doc.createdBy.toHexString(),
    tags: doc.tags,
    reminders: doc.reminders ?? [],
    firedReminders: doc.firedReminders ?? [],
    recurrenceRule: doc.recurrenceRule,
    followUpDate: doc.followUpDate,
    organizationId: doc.organizationId.toHexString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function resolveOrgId(req: Request): string {
  return req.body?.organizationId || query(req, "organizationId") || req.user?.organizationId || "";
}

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, projectId, priority, assigneeId, dueDate, tags, reminders, recurrenceRule, followUpDate } = req.body as {
    title?: string; description?: string; projectId?: string; priority?: string;
    assigneeId?: string; dueDate?: string; tags?: string[];
    reminders?: string[]; recurrenceRule?: string; followUpDate?: string;
  };
  if (!title) throw HttpError.badRequest("Title is required");

  const orgId = resolveOrgId(req);
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const createdBy = req.user?.userId || req.body.createdBy || "system";

  const task = await TaskRepo.createTask({
    title, description, projectId,
    priority: priority as Priority | undefined,
    assigneeId, dueDate, tags, reminders, recurrenceRule, followUpDate,
    createdBy,
    organizationId: orgId,
  });
  ok(res, toPublic(task));
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const page = parseInt(query(req, "page") || "1", 10);
  const limit = parseInt(query(req, "limit") || "20", 10);

  const { tasks, total } = await TaskRepo.findTasks({
    organizationId: orgId,
    projectId: query(req, "projectId"),
    assigneeId: query(req, "assigneeId"),
    status: query(req, "status") as TaskStatus | undefined,
    priority: query(req, "priority") as Priority | undefined,
    page,
    limit,
  });
  paginated(res, tasks.map(toPublic), page, total, limit);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskRepo.findTaskById(param(req, "id"));
  if (!task) throw HttpError.notFound("Task");
  ok(res, toPublic(task));
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    title?: string;
    description?: string;
    projectId?: string | null;
    priority?: Priority;
    dueDate?: string | null;
    tags?: string[];
    assigneeId?: string | null;
    subtasks?: any[];
    comments?: any[];
    reminders?: string[];
    recurrenceRule?: string | null;
    followUpDate?: string | null;
  };
  const task = await TaskRepo.updateTask(param(req, "id"), body);
  if (!task) throw HttpError.notFound("Task");
  ok(res, toPublic(task));
});

export const updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };
  if (!status || !Object.values(TaskStatus).includes(status as TaskStatus)) {
    throw HttpError.badRequest(`Invalid status. Valid: ${Object.values(TaskStatus).join(", ")}`);
  }
  const task = await TaskRepo.updateTaskStatus(param(req, "id"), status as TaskStatus);
  if (!task) throw HttpError.notFound("Task");
  ok(res, toPublic(task));
});

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const { assigneeId } = req.body as { assigneeId?: string };
  if (!assigneeId) throw HttpError.badRequest("assigneeId is required");
  const task = await TaskRepo.assignTask(param(req, "id"), assigneeId);
  if (!task) throw HttpError.notFound("Task");
  ok(res, toPublic(task));
});

export const unassignTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskRepo.unassignTask(param(req, "id"));
  if (!task) throw HttpError.notFound("Task");
  ok(res, toPublic(task));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const success = await TaskRepo.deleteTask(param(req, "id"));
  if (!success) throw HttpError.notFound("Task");
  ok(res, null, "Task deleted");
});

import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as AssignmentRepo from "../database/assignment-repository.js";
import { query } from "../helpers.js";

function toPublic(doc: any) {
  return {
    id: doc._id.toHexString(),
    taskId: doc.taskId.toHexString(),
    userId: doc.userId.toHexString(),
    assignedBy: doc.assignedBy.toHexString(),
    organizationId: doc.organizationId.toHexString(),
    createdAt: doc.createdAt,
  };
}

export const assignTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId, userId, organizationId } = req.body as {
    taskId?: string; userId?: string; organizationId?: string;
  };
  if (!taskId || !userId) throw HttpError.badRequest("taskId and userId are required");

  const assignedBy = req.user?.userId || "system";
  const orgId = organizationId || req.user?.organizationId || "";
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const assignment = await AssignmentRepo.createAssignment({ taskId, userId, assignedBy, organizationId: orgId });
  ok(res, toPublic(assignment));
});

export const unassignTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId, userId } = req.body as { taskId?: string; userId?: string };
  if (!taskId || !userId) throw HttpError.badRequest("taskId and userId are required");

  const success = await AssignmentRepo.deleteAssignment(taskId, userId);
  if (!success) throw HttpError.notFound("Assignment");
  ok(res, null, "Assignment removed");
});

export const listMyTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = query(req, "userId") || req.user?.userId;
  const orgId = query(req, "organizationId") || req.user?.organizationId;
  if (!userId || !orgId) throw HttpError.badRequest("userId and organizationId are required");

  const assignments = await AssignmentRepo.findByUser(userId, orgId);
  ok(res, assignments.map(toPublic));
});

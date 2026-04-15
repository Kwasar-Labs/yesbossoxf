import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as Repo from "../database/user-memory-repository.js";
import { param, query as queryHelper } from "../helpers.js";

function toPublic(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toHexString(),
    userId: doc.userId,
    organizationId: doc.organizationId.toHexString(),
    preferences: doc.preferences || {},
    skills: doc.skills || [],
    recentContext: doc.recentContext || { recentTaskIds: [], recentProjectIds: [] },
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const getMemory = asyncHandler(async (req: Request, res: Response) => {
  const userId = param(req, "userId");
  const orgId = queryHelper(req, "organizationId") || req.user?.organizationId;
  if (!orgId) throw HttpError.badRequest("organizationId is required");
  const doc = await Repo.getUserMemory(userId, orgId);
  ok(res, doc ? toPublic(doc) : null);
});

export const upsertMemory = asyncHandler(async (req: Request, res: Response) => {
  const { userId, organizationId, preferences, skills, recentContext, notes } = req.body as any;
  if (!userId) throw HttpError.badRequest("userId is required");
  if (!organizationId) throw HttpError.badRequest("organizationId is required");
  const doc = await Repo.upsertUserMemory({
    userId,
    organizationId,
    preferences,
    skills,
    recentContext,
    notes,
  });
  ok(res, toPublic(doc));
});

export const pushRecent = asyncHandler(async (req: Request, res: Response) => {
  const { userId, organizationId, taskId, projectId, cap } = req.body as any;
  if (!userId) throw HttpError.badRequest("userId is required");
  if (!organizationId) throw HttpError.badRequest("organizationId is required");
  await Repo.pushRecentActivity(userId, organizationId, { taskId, projectId, cap });
  ok(res, { success: true });
});

export const addSkill = asyncHandler(async (req: Request, res: Response) => {
  const { userId, organizationId, skill, delta } = req.body as any;
  if (!userId || !organizationId || !skill) {
    throw HttpError.badRequest("userId, organizationId, skill required");
  }
  await Repo.addUserSkill(userId, organizationId, skill, typeof delta === "number" ? delta : 0.1);
  ok(res, { success: true });
});

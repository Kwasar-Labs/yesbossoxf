import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as TeamRepo from "../database/team-repository.js";
import { param, query } from "../helpers.js";

function toPublic(doc: any) {
  return {
    _id: doc._id.toHexString(),
    name: doc.name,
    description: doc.description,
    organizationId: doc.organizationId.toHexString(),
    memberIds: doc.memberIds.map((m: any) => m.toHexString()),
    leadId: doc.leadId?.toHexString(),
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const listTeams = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user?.organizationId || query(req, "organizationId");
  if (!orgId) throw HttpError.badRequest("organizationId is required");
  const teams = await TeamRepo.findTeamsByOrg(orgId);
  ok(res, teams.map(toPublic));
});

export const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await TeamRepo.findTeamById(param(req, "id"));
  if (!team) throw HttpError.notFound("Team");
  ok(res, toPublic(team));
});

export const createTeam = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, leadId, memberIds } = req.body as {
    name?: string; description?: string; leadId?: string; memberIds?: string[];
  };
  if (!name) throw HttpError.badRequest("Name is required");
  const orgId = (req.body as any).organizationId || req.user?.organizationId;
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const team = await TeamRepo.createTeam({ name, description, organizationId: orgId, leadId, memberIds });
  ok(res, toPublic(team));
});

export const updateTeam = asyncHandler(async (req: Request, res: Response) => {
  const team = await TeamRepo.updateTeamById(param(req, "id"), req.body as {
    name?: string; description?: string; leadId?: string; isActive?: boolean;
  });
  if (!team) throw HttpError.notFound("Team");
  ok(res, toPublic(team));
});

export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body as { userId?: string };
  if (!userId) throw HttpError.badRequest("userId is required");
  const success = await TeamRepo.addMember(param(req, "id"), userId);
  if (!success) throw HttpError.notFound("Team");
  ok(res, null, "Member added");
});

export const removeTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body as { userId?: string };
  if (!userId) throw HttpError.badRequest("userId is required");
  const success = await TeamRepo.removeMember(param(req, "id"), userId);
  if (!success) throw HttpError.notFound("Team");
  ok(res, null, "Member removed");
});

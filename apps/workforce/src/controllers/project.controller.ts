import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as ProjectRepo from "../database/project-repository.js";
import { param, query } from "../helpers.js";
import { ProjectStatus } from "@yesboss/types";

function toPublic(doc: any) {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    description: doc.description,
    organizationId: doc.organizationId.toHexString(),
    status: doc.status,
    ownerIds: doc.ownerIds.map((o: any) => o.toHexString()),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function resolveOrgId(req: Request): string {
  return req.body?.organizationId || query(req, "organizationId") || req.user?.organizationId || "";
}

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, ownerIds } = req.body as {
    name?: string; description?: string; ownerIds?: string[];
  };
  if (!name) throw HttpError.badRequest("Name is required");

  const orgId = resolveOrgId(req);
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const project = await ProjectRepo.createProject({ name, description, organizationId: orgId, ownerIds });
  ok(res, toPublic(project));
});

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const projects = await ProjectRepo.findProjects(orgId);
  ok(res, projects.map(toPublic));
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await ProjectRepo.findProjectById(param(req, "id"));
  if (!project) throw HttpError.notFound("Project");
  ok(res, toPublic(project));
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { name?: string; description?: string; status?: string; ownerIds?: string[] };
  const project = await ProjectRepo.updateProject(param(req, "id"), {
    ...body,
    status: body.status as ProjectStatus | undefined,
  });
  if (!project) throw HttpError.notFound("Project");
  ok(res, toPublic(project));
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const success = await ProjectRepo.deleteProject(param(req, "id"));
  if (!success) throw HttpError.notFound("Project");
  ok(res, null, "Project deleted");
});

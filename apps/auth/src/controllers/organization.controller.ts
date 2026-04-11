import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as OrgRepo from "../database/organization-repository.js";
import { param } from "../helpers.js";

function toPublic(doc: any) {
  return {
    _id: doc._id.toHexString(),
    name: doc.name,
    description: doc.description,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const listOrgs = asyncHandler(async (_req: Request, res: Response) => {
  const orgs = await OrgRepo.findAllOrgs();
  ok(res, orgs.map(toPublic));
});

export const getOrg = asyncHandler(async (req: Request, res: Response) => {
  const org = await OrgRepo.findOrgById(param(req, "id"));
  if (!org) throw HttpError.notFound("Organization");
  ok(res, toPublic(org));
});

export const createOrg = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.name) throw HttpError.badRequest("Name is required");
  const org = await OrgRepo.createOrg(req.body);
  ok(res, toPublic(org));
});

export const updateOrg = asyncHandler(async (req: Request, res: Response) => {
  const org = await OrgRepo.updateOrgById(param(req, "id"), req.body);
  if (!org) throw HttpError.notFound("Organization");
  ok(res, toPublic(org));
});

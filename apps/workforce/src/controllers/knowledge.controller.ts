import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as Repo from "../database/knowledge-repository.js";
import { KnowledgeFactCreateInput, KnowledgeFactUpdateInput, FactCategory } from "@yesboss/types";
import { param, query as queryHelper } from "../helpers.js";

function resolveOrgId(req: Request): string {
  return req.body?.organizationId || queryHelper(req, "organizationId") || req.user?.organizationId || "";
}

function toPublic(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toHexString(),
    organizationId: doc.organizationId.toHexString(),
    content: doc.content,
    category: doc.category,
    referenceId: doc.referenceId,
    tags: doc.tags || [],
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const createFact = asyncHandler(async (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  if (!orgId) throw HttpError.badRequest("organizationId is required");
  
  const { content, category, referenceId, tags } = req.body as any;
  if (!content) throw HttpError.badRequest("content is required");
  if (!category) throw HttpError.badRequest("category is required");
  
  const createdBy = req.user?.userId || "system";
  
  const fact = await Repo.createFact({
    organizationId: orgId,
    content,
    category,
    referenceId,
    tags,
    createdBy
  });
  
  ok(res, toPublic(fact));
});

export const getFact = asyncHandler(async (req: Request, res: Response) => {
  const fact = await Repo.getFact(param(req, "id"));
  if (!fact) throw HttpError.notFound("Fact");
  ok(res, toPublic(fact));
});

export const searchFacts = asyncHandler(async (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  if (!orgId) throw HttpError.badRequest("organizationId is required");
  
  const { q, category, referenceId } = req.query as any;
  
  const facts = await Repo.findFactsByOrg(orgId, { q, category, referenceId });
  ok(res, facts.map(toPublic));
});

export const updateFact = asyncHandler(async (req: Request, res: Response) => {
  const fact = await Repo.updateFact(param(req, "id"), req.body as KnowledgeFactUpdateInput);
  if (!fact) throw HttpError.notFound("Fact");
  ok(res, toPublic(fact));
});

export const deleteFact = asyncHandler(async (req: Request, res: Response) => {
  const success = await Repo.deleteFact(param(req, "id"));
  if (!success) throw HttpError.notFound("Fact");
  ok(res, { deleted: true });
});
import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as Repo from "../database/knowledge-repository.js";
import { KnowledgeFactUpdateInput, FactCategory } from "@yesboss/types";
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
    source: doc.source,
    confidence: doc.confidence,
    useCount: doc.useCount ?? 0,
    lastUsedAt: doc.lastUsedAt,
    expiresAt: doc.expiresAt,
    supersededBy: doc.supersededBy,
    supersedes: doc.supersedes,
    hasEmbedding: Array.isArray(doc.embedding) && doc.embedding.length > 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const createFact = asyncHandler(async (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const { content, category, referenceId, tags, source, confidence, expiresAt, supersedes } =
    req.body as any;
  if (!content) throw HttpError.badRequest("content is required");
  if (!category) throw HttpError.badRequest("category is required");

  const createdBy = req.user?.userId || "system";

  const fact = await Repo.createFact({
    organizationId: orgId,
    content,
    category,
    referenceId,
    tags,
    createdBy,
    source,
    confidence,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    supersedes,
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

  const { q, category, referenceId, tags, limit, minConfidence, useEmbedding } = req.query as any;

  const tagArr = typeof tags === "string" ? tags.split(",").filter(Boolean) : Array.isArray(tags) ? tags : undefined;

  const facts = await Repo.searchFacts({
    organizationId: orgId,
    q,
    category: category as FactCategory | undefined,
    referenceId,
    tags: tagArr,
    limit: limit ? parseInt(limit, 10) : undefined,
    minConfidence: minConfidence ? parseFloat(minConfidence) : undefined,
    useEmbedding: useEmbedding === "false" ? false : true,
  });
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

export const backfillEmbeddings = asyncHandler(async (req: Request, res: Response) => {
  const orgId = resolveOrgId(req);
  const batchSize = parseInt((req.query as any).batchSize || "50", 10);
  const updated = await Repo.backfillEmbeddings(orgId || undefined, batchSize);
  ok(res, { updated });
});

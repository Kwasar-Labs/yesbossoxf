import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as Repo from "../database/session-repository.js";
import { param } from "../helpers.js";

function toPublic(doc: any) {
  if (!doc) return null;
  return {
    _id: doc._id.toHexString(),
    phoneE164: doc.phoneE164,
    userId: doc.userId,
    organizationId: doc.organizationId?.toHexString?.(),
    turns: doc.turns || [],
    activeIntent: doc.activeIntent,
    pendingConfirmation: doc.pendingConfirmation,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const phone = param(req, "phone");
  const doc = await Repo.getSession(phone);
  ok(res, doc ? toPublic(doc) : null);
});

export const appendTurn = asyncHandler(async (req: Request, res: Response) => {
  const {
    phoneE164,
    userId,
    organizationId,
    turn,
    activeIntent,
    pendingConfirmation,
    maxTurns,
    ttlHours,
  } = req.body as any;

  if (!phoneE164) throw HttpError.badRequest("phoneE164 is required");
  if (!turn || !turn.role || typeof turn.content !== "string") {
    throw HttpError.badRequest("turn with role and content required");
  }

  const doc = await Repo.appendTurn({
    phoneE164,
    userId,
    organizationId,
    turn,
    activeIntent,
    pendingConfirmation,
    maxTurns,
    ttlHours,
  });
  ok(res, toPublic(doc));
});

export const setIntent = asyncHandler(async (req: Request, res: Response) => {
  const { phoneE164, intent } = req.body as any;
  if (!phoneE164) throw HttpError.badRequest("phoneE164 is required");
  await Repo.setActiveIntent(phoneE164, intent ?? null);
  ok(res, { success: true });
});

export const setConfirmation = asyncHandler(async (req: Request, res: Response) => {
  const { phoneE164, pending } = req.body as any;
  if (!phoneE164) throw HttpError.badRequest("phoneE164 is required");
  await Repo.setPendingConfirmation(phoneE164, pending ?? null);
  ok(res, { success: true });
});

export const clearSession = asyncHandler(async (req: Request, res: Response) => {
  const phone = param(req, "phone");
  const removed = await Repo.clearSession(phone);
  ok(res, { cleared: removed });
});

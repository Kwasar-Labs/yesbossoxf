import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok } from "@yesboss/utils";
import * as MappingRepo from "../database/phone-user-mapping-repository.js";
import * as UserRepo from "../database/user-repository.js";
import { param, query } from "../helpers.js";

function toPublic(doc: any) {
  return {
    _id: doc._id.toHexString(),
    phoneE164: doc.phoneE164,
    userId: doc.userId.toHexString(),
    organizationId: doc.organizationId.toHexString(),
    verifiedAt: doc.verifiedAt,
  };
}

export const createMapping = asyncHandler(async (req: Request, res: Response) => {
  const { phoneE164, userId, organizationId } = req.body as {
    phoneE164?: string; userId?: string; organizationId?: string;
  };
  if (!phoneE164 || !userId) throw HttpError.badRequest("phoneE164 and userId are required");

  const user = await UserRepo.findById(userId);
  if (!user) throw HttpError.notFound("User");

  const orgId = organizationId || user.organizationId.toHexString();
  const mapping = await MappingRepo.createMapping({ phoneE164, userId, organizationId: orgId });
  ok(res, toPublic(mapping));
});

export const getMappingByPhone = asyncHandler(async (req: Request, res: Response) => {
  const mapping = await MappingRepo.findByPhone(param(req, "e164"));
  if (!mapping) throw HttpError.notFound("Phone mapping");

  const user = await UserRepo.findById(mapping.userId.toHexString());
  ok(res, {
    mapping: toPublic(mapping),
    user: user ? {
      id: user._id.toHexString(),
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toHexString(),
    } : null,
  });
});

export const deleteMapping = asyncHandler(async (req: Request, res: Response) => {
  const success = await MappingRepo.deleteByPhone(param(req, "e164"));
  if (!success) throw HttpError.notFound("Phone mapping");
  ok(res, null, "Mapping deleted");
});

export const listMappings = asyncHandler(async (req: Request, res: Response) => {
  const orgId = query(req, "organizationId");
  const mappings = await MappingRepo.findAllMappings(orgId);
  ok(res, mappings.map(toPublic));
});

import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, ok, hashPassword } from "@yesboss/utils";
import * as UserRepo from "../database/user-repository.js";
import { param, query } from "../helpers.js";

function toPublicUser(doc: Awaited<ReturnType<typeof UserRepo.findById>>) {
  if (!doc) return null;
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    phoneE164: doc.phoneE164,
    role: doc.role,
    organizationId: doc.organizationId.toHexString(),
    teamIds: doc.teamIds.map((t) => t.toHexString()),
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const orgId = req.user?.organizationId || query(req, "organizationId");
  if (!orgId) throw HttpError.badRequest("organizationId is required");
  const users = await UserRepo.findAll(orgId);
  ok(res, users.map(toPublicUser));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserRepo.findById(param(req, "id"));
  if (!user) throw HttpError.notFound("User");
  ok(res, toPublicUser(user));
});

export const getUserByPhone = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserRepo.findByPhone(param(req, "e164"));
  if (!user) throw HttpError.notFound("User with that phone number");
  ok(res, toPublicUser(user));
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password, phoneE164, role, organizationId, teamIds } = req.body as {
    email?: string; name?: string; password?: string; phoneE164?: string;
    role?: string; organizationId?: string; teamIds?: string[];
  };
  if (!email || !name || !password) throw HttpError.badRequest("Email, name, and password are required");

  const existing = await UserRepo.findByEmail(email);
  if (existing) throw HttpError.conflict("Email already registered");

  const passwordHash = await hashPassword(password);
  const orgId = organizationId || req.user?.organizationId;
  if (!orgId) throw HttpError.badRequest("organizationId is required");

  const user = await UserRepo.createUser({ email, name, passwordHash, phoneE164, role: role as any, organizationId: orgId, teamIds });
  ok(res, toPublicUser(user));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserRepo.updateById(param(req, "id"), req.body);
  if (!user) throw HttpError.notFound("User");
  ok(res, toPublicUser(user));
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const success = await UserRepo.deactivateById(param(req, "id"));
  if (!success) throw HttpError.notFound("User");
  ok(res, null, "User deactivated");
});

import type { Request, Response } from "express";
import { HttpError } from "@yesboss/errors";
import { asyncHandler, hashPassword, comparePassword, generateToken } from "@yesboss/utils";
import { ok } from "@yesboss/utils";
import * as UserRepo from "../database/user-repository.js";
import { env } from "../config/env.js";

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

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) throw HttpError.badRequest("Email and password are required");

  const user = await UserRepo.findByEmail(email);
  if (!user) throw HttpError.unauthorized("Invalid credentials");

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw HttpError.unauthorized("Invalid credentials");

  const token = generateToken(
    {
      userId: user._id.toHexString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toHexString(),
    },
    env.JWT_PRIVATE_KEY_PATH,
  );

  ok(res, { token, user: toPublicUser(user) });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password, phoneE164, role, organizationId, teamIds } = req.body as {
    email?: string; name?: string; password?: string; phoneE164?: string;
    role?: string; organizationId?: string; teamIds?: string[];
  };
  if (!email || !name || !password || !organizationId) {
    throw HttpError.badRequest("Email, name, password, and organizationId are required");
  }

  const existing = await UserRepo.findByEmail(email);
  if (existing) throw HttpError.conflict("Email already registered");

  const passwordHash = await hashPassword(password);
  const user = await UserRepo.createUser({
    email, name, passwordHash, phoneE164, role: role as any, organizationId, teamIds,
  });

  const token = generateToken(
    {
      userId: user._id.toHexString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toHexString(),
    },
    env.JWT_PRIVATE_KEY_PATH,
  );

  ok(res, { token, user: toPublicUser(user) }, "Registration successful");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserRepo.findById(req.user!.userId);
  if (!user) throw HttpError.notFound("User");
  ok(res, toPublicUser(user));
});

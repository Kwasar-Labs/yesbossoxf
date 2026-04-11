import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";
import type { UserCreateInput, UserUpdateInput } from "@yesboss/types";
import { UserRole } from "@yesboss/types";

const COLLECTION = "users";

function getCollection(): Collection {
  return getDb().collection(COLLECTION);
}

export interface UserDocument {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  phoneE164?: string;
  role: UserRole;
  organizationId: ObjectId;
  teamIds: ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserInput {
  email: string;
  name: string;
  passwordHash: string;
  phoneE164?: string;
  role?: UserRole;
  organizationId: string;
  teamIds?: string[];
}

export async function createUser(input: CreateUserInput): Promise<UserDocument> {
  const now = new Date();
  const doc = {
    email: input.email,
    name: input.name,
    passwordHash: input.passwordHash,
    phoneE164: input.phoneE164,
    role: input.role || UserRole.MEMBER,
    organizationId: new ObjectId(input.organizationId),
    teamIds: (input.teamIds || []).map((id: string) => new ObjectId(id)),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId } as UserDocument;
}

export async function findByEmail(email: string): Promise<UserDocument | null> {
  return getCollection().findOne({ email, isActive: true }) as Promise<UserDocument | null>;
}

export async function findById(id: string): Promise<UserDocument | null> {
  return getCollection().findOne({ _id: new ObjectId(id), isActive: true }) as Promise<UserDocument | null>;
}

export async function findByPhone(phoneE164: string): Promise<UserDocument | null> {
  return getCollection().findOne({ phoneE164, isActive: true }) as Promise<UserDocument | null>;
}

export async function findAll(organizationId: string): Promise<UserDocument[]> {
  return getCollection()
    .find({ organizationId: new ObjectId(organizationId), isActive: true })
    .sort({ createdAt: -1 })
    .toArray() as Promise<UserDocument[]>;
}

export async function updateById(id: string, input: UserUpdateInput): Promise<UserDocument | null> {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) update.name = input.name;
  if (input.phoneE164 !== undefined) update.phoneE164 = input.phoneE164;
  if (input.role !== undefined) update.role = input.role;
  if (input.isActive !== undefined) update.isActive = input.isActive;
  if (input.teamIds !== undefined) {
    update.teamIds = input.teamIds.map((id: string) => new ObjectId(id));
  }

  await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: update },
  );
  return findById(id);
}

export async function deactivateById(id: string): Promise<boolean> {
  const result = await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { isActive: false, updatedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}

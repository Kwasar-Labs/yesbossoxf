import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "teams";

interface TeamDocument {
  _id: ObjectId;
  name: string;
  description?: string;
  organizationId: ObjectId;
  memberIds: ObjectId[];
  leadId?: ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection {
  return getDb().collection(COLLECTION);
}

export async function createTeam(input: {
  name: string;
  description?: string;
  organizationId: string;
  leadId?: string;
  memberIds?: string[];
}): Promise<TeamDocument> {
  const now = new Date();
  const doc = {
    name: input.name,
    description: input.description,
    organizationId: new ObjectId(input.organizationId),
    leadId: input.leadId ? new ObjectId(input.leadId) : undefined,
    memberIds: (input.memberIds || []).map((id) => new ObjectId(id)),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId } as TeamDocument;
}

export async function findTeamById(id: string): Promise<TeamDocument | null> {
  return getCollection().findOne({ _id: new ObjectId(id) }) as Promise<TeamDocument | null>;
}

export async function findTeamsByOrg(organizationId: string): Promise<TeamDocument[]> {
  return getCollection()
    .find({ organizationId: new ObjectId(organizationId), isActive: true })
    .sort({ name: 1 })
    .toArray() as Promise<TeamDocument[]>;
}

export async function addMember(teamId: string, userId: string): Promise<boolean> {
  const result = await getCollection().updateOne(
    { _id: new ObjectId(teamId) },
    { $addToSet: { memberIds: new ObjectId(userId) }, $set: { updatedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}

export async function removeMember(teamId: string, userId: string): Promise<boolean> {
  const result = await getCollection().updateOne(
    { _id: new ObjectId(teamId) },
    { $pull: { memberIds: new ObjectId(userId) as any }, $set: { updatedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}

export async function updateTeamById(id: string, input: { name?: string; description?: string; leadId?: string; isActive?: boolean }): Promise<TeamDocument | null> {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.leadId !== undefined) update.leadId = new ObjectId(input.leadId);
  if (input.isActive !== undefined) update.isActive = input.isActive;

  await getCollection().updateOne({ _id: new ObjectId(id) }, { $set: update });
  return findTeamById(id);
}

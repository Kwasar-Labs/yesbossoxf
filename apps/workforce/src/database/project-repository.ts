import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";
import { ProjectStatus } from "@yesboss/types";

const COLLECTION = "projects";

interface ProjectDocument {
  _id: ObjectId;
  name: string;
  description?: string;
  organizationId: ObjectId;
  status: ProjectStatus;
  ownerIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection {
  return getDb().collection(COLLECTION);
}

export async function createProject(input: {
  name: string;
  description?: string;
  organizationId: string;
  ownerIds?: string[];
}): Promise<ProjectDocument> {
  const now = new Date();
  const doc = {
    name: input.name,
    description: input.description,
    organizationId: new ObjectId(input.organizationId),
    status: ProjectStatus.ACTIVE,
    ownerIds: (input.ownerIds || []).map((id) => new ObjectId(id)),
    createdAt: now,
    updatedAt: now,
  };
  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId } as ProjectDocument;
}

export async function findProjectById(id: string): Promise<ProjectDocument | null> {
  return getCollection().findOne({ _id: new ObjectId(id) }) as Promise<ProjectDocument | null>;
}

export async function findProjects(organizationId: string): Promise<ProjectDocument[]> {
  return getCollection()
    .find({ organizationId: new ObjectId(organizationId) })
    .sort({ name: 1 })
    .toArray() as Promise<ProjectDocument[]>;
}

export async function updateProject(id: string, input: {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  ownerIds?: string[];
}): Promise<ProjectDocument | null> {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.status !== undefined) update.status = input.status;
  if (input.ownerIds !== undefined) update.ownerIds = input.ownerIds.map((id) => new ObjectId(id));

  await getCollection().updateOne({ _id: new ObjectId(id) }, { $set: update });
  return findProjectById(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await getCollection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

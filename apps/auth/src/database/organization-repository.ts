import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "organizations";

interface OrgDocument {
  _id: ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection {
  return getDb().collection(COLLECTION);
}

export async function createOrg(input: { name: string; description?: string }): Promise<OrgDocument> {
  const now = new Date();
  const doc = { ...input, isActive: true, createdAt: now, updatedAt: now };
  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId } as OrgDocument;
}

export async function findOrgById(id: string): Promise<OrgDocument | null> {
  return getCollection().findOne({ _id: new ObjectId(id) }) as Promise<OrgDocument | null>;
}

export async function findAllOrgs(): Promise<OrgDocument[]> {
  return getCollection().find({ isActive: true }).sort({ name: 1 }).toArray() as Promise<OrgDocument[]>;
}

export async function updateOrgById(id: string, input: { name?: string; description?: string; isActive?: boolean }): Promise<OrgDocument | null> {
  const update = { ...input, updatedAt: new Date() };
  await getCollection().updateOne({ _id: new ObjectId(id) }, { $set: update });
  return findOrgById(id);
}

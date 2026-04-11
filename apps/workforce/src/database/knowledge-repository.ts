import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";
import { FactCategory, KnowledgeFact, KnowledgeFactCreateInput, KnowledgeFactUpdateInput } from "@yesboss/types";

const COLLECTION = "knowledge_facts";

interface KnowledgeFactDocument {
  _id: ObjectId;
  organizationId: ObjectId;
  content: string;
  category: string;
  referenceId?: string;
  tags?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection<KnowledgeFactDocument> {
  return getDb().collection<KnowledgeFactDocument>(COLLECTION);
}

export async function createFact(input: KnowledgeFactCreateInput): Promise<KnowledgeFactDocument> {
  const collection = getCollection();
  const now = new Date();
  
  const doc = {
    _id: new ObjectId(),
    organizationId: new ObjectId(input.organizationId),
    content: input.content,
    category: input.category,
    referenceId: input.referenceId,
    tags: input.tags,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  
  await collection.insertOne(doc);
  return doc;
}

export async function getFact(id: string): Promise<KnowledgeFactDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  return getCollection().findOne({ _id: new ObjectId(id) });
}

export async function findFactsByOrg(organizationId: string, filter?: { category?: string; referenceId?: string; q?: string }): Promise<KnowledgeFactDocument[]> {
  const query: any = { organizationId: new ObjectId(organizationId) };
  if (filter?.category) query.category = filter.category;
  if (filter?.referenceId) query.referenceId = filter.referenceId;
  if (filter?.q) {
    query.content = { $regex: filter.q, $options: "i" };
  }
  
  return getCollection().find(query).sort({ createdAt: -1 }).toArray();
}

export async function updateFact(id: string, input: KnowledgeFactUpdateInput): Promise<KnowledgeFactDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  
  const updateDoc: any = {
    updatedAt: new Date(),
  };
  if (input.content !== undefined) updateDoc.content = input.content;
  if (input.category !== undefined) updateDoc.category = input.category;
  if (input.referenceId !== undefined) updateDoc.referenceId = input.referenceId;
  if (input.tags !== undefined) updateDoc.tags = input.tags;
  
  const result = await getCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: "after" }
  );
  
  return result;
}

export async function deleteFact(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await getCollection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "phone_user_mappings";

interface PhoneMappingDocument {
  _id: ObjectId;
  phoneE164: string;
  userId: ObjectId;
  organizationId: ObjectId;
  verifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection {
  return getDb().collection(COLLECTION);
}

export async function createMapping(input: {
  phoneE164: string;
  userId: string;
  organizationId: string;
}): Promise<PhoneMappingDocument> {
  const now = new Date();
  const doc = {
    phoneE164: input.phoneE164,
    userId: new ObjectId(input.userId),
    organizationId: new ObjectId(input.organizationId),
    verifiedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  await getCollection().createIndex({ phoneE164: 1 }, { unique: true });
  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId } as PhoneMappingDocument;
}

export async function findByPhone(phoneE164: string): Promise<PhoneMappingDocument | null> {
  return getCollection().findOne({ phoneE164 }) as Promise<PhoneMappingDocument | null>;
}

export async function deleteByPhone(phoneE164: string): Promise<boolean> {
  const result = await getCollection().deleteOne({ phoneE164 });
  return result.deletedCount > 0;
}

export async function findAllMappings(organizationId?: string): Promise<PhoneMappingDocument[]> {
  const filter: Record<string, unknown> = {};
  if (organizationId) filter.organizationId = new ObjectId(organizationId);
  return getCollection().find(filter).sort({ createdAt: -1 }).toArray() as Promise<PhoneMappingDocument[]>;
}

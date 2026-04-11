import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "assignments";

interface AssignmentDocument {
  _id: ObjectId;
  taskId: ObjectId;
  userId: ObjectId;
  assignedBy: ObjectId;
  organizationId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection {
  return getDb().collection(COLLECTION);
}

export async function createAssignment(input: {
  taskId: string;
  userId: string;
  assignedBy: string;
  organizationId: string;
}): Promise<AssignmentDocument> {
  const now = new Date();
  const doc = {
    taskId: new ObjectId(input.taskId),
    userId: new ObjectId(input.userId),
    assignedBy: new ObjectId(input.assignedBy),
    organizationId: new ObjectId(input.organizationId),
    createdAt: now,
    updatedAt: now,
  };
  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId } as AssignmentDocument;
}

export async function findByTask(taskId: string): Promise<AssignmentDocument[]> {
  return getCollection()
    .find({ taskId: new ObjectId(taskId) })
    .sort({ createdAt: -1 })
    .toArray() as Promise<AssignmentDocument[]>;
}

export async function findByUser(userId: string, organizationId: string): Promise<AssignmentDocument[]> {
  return getCollection()
    .find({ userId: new ObjectId(userId), organizationId: new ObjectId(organizationId) })
    .sort({ createdAt: -1 })
    .toArray() as Promise<AssignmentDocument[]>;
}

export async function deleteAssignment(taskId: string, userId: string): Promise<boolean> {
  const result = await getCollection().deleteOne({
    taskId: new ObjectId(taskId),
    userId: new ObjectId(userId),
  });
  return result.deletedCount > 0;
}

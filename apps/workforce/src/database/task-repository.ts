import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";
import { TaskStatus, Priority } from "@yesboss/types";

const COLLECTION = "tasks";

interface TaskDocument {
  _id: ObjectId;
  title: string;
  description?: string;
  projectId?: ObjectId;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: ObjectId;
  dueDate?: Date;
  createdBy: ObjectId;
  tags: string[];
  organizationId: ObjectId;
  subtasks?: any[];
  comments?: any[];
  reminders?: Date[];
  firedReminders?: Date[];
  recurrenceRule?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection {
  return getDb().collection(COLLECTION);
}

export async function createTask(input: {
  title: string;
  description?: string;
  projectId?: string;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
  reminders?: string[];
  recurrenceRule?: string;
  followUpDate?: string;
  createdBy: string;
  organizationId: string;
}): Promise<TaskDocument> {
  const now = new Date();
  const doc = {
    title: input.title,
    description: input.description,
    projectId: input.projectId ? new ObjectId(input.projectId) : undefined,
    status: TaskStatus.TODO,
    priority: input.priority || Priority.MEDIUM,
    assigneeId: input.assigneeId ? new ObjectId(input.assigneeId) : undefined,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    createdBy: input.createdBy && input.createdBy !== "system" ? new ObjectId(input.createdBy) : (input.createdBy as any),
    tags: input.tags || [],
    reminders: input.reminders?.map((r) => new Date(r)) ?? [],
    firedReminders: [] as Date[],
    recurrenceRule: input.recurrenceRule,
    followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined,
    organizationId: new ObjectId(input.organizationId),
    createdAt: now,
    updatedAt: now,
  };
  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId } as TaskDocument;
}

export async function findTaskById(id: string): Promise<TaskDocument | null> {
  return getCollection().findOne({ _id: new ObjectId(id) }) as Promise<TaskDocument | null>;
}

export async function findTasks(filters: {
  organizationId: string;
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  page?: number;
  limit?: number;
}): Promise<{ tasks: TaskDocument[]; total: number }> {
  const query: Record<string, unknown> = {
    organizationId: new ObjectId(filters.organizationId),
  };
  if (filters.projectId) query.projectId = new ObjectId(filters.projectId);
  if (filters.assigneeId) query.assigneeId = new ObjectId(filters.assigneeId);
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    getCollection().find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    getCollection().countDocuments(query),
  ]);

  return { tasks: tasks as TaskDocument[], total };
}

export async function updateTask(id: string, input: {
  title?: string;
  description?: string;
  projectId?: string | null;
  priority?: Priority;
  dueDate?: string | null;
  tags?: string[];
  assigneeId?: string | null;
  subtasks?: any[];
  comments?: any[];
  reminders?: string[];
  recurrenceRule?: string | null;
  followUpDate?: string | null;
}): Promise<TaskDocument | null> {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.projectId !== undefined) update.projectId = input.projectId ? new ObjectId(input.projectId) : null;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.dueDate !== undefined) update.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.tags !== undefined) update.tags = input.tags;
  if (input.assigneeId !== undefined) update.assigneeId = input.assigneeId ? new ObjectId(input.assigneeId) : null;
  if (input.subtasks !== undefined) update.subtasks = input.subtasks;
  if (input.comments !== undefined) update.comments = input.comments;
  if (input.reminders !== undefined) {
    update.reminders = input.reminders.map((r) => new Date(r));
    update.firedReminders = [];
  }
  if (input.recurrenceRule !== undefined) update.recurrenceRule = input.recurrenceRule;
  if (input.followUpDate !== undefined) update.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;

  await getCollection().updateOne({ _id: new ObjectId(id) }, { $set: update });
  return findTaskById(id);
}

export async function findTasksWithDueReminders(before: Date): Promise<TaskDocument[]> {
  return getCollection().find({
    reminders: { $elemMatch: { $lte: before } },
  }).toArray() as Promise<TaskDocument[]>;
}

export async function markReminderFired(id: string, reminderDate: Date): Promise<void> {
  await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $addToSet: { firedReminders: reminderDate } },
  );
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<TaskDocument | null> {
  await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
  );
  return findTaskById(id);
}

export async function assignTask(id: string, assigneeId: string): Promise<TaskDocument | null> {
  await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { assigneeId: new ObjectId(assigneeId), updatedAt: new Date() } },
  );
  return findTaskById(id);
}

export async function unassignTask(id: string): Promise<TaskDocument | null> {
  await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { assigneeId: null, updatedAt: new Date() } },
  );
  return findTaskById(id);
}

export async function deleteTask(id: string): Promise<boolean> {
  const result = await getCollection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

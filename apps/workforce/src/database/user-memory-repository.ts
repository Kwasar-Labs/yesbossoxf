import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";
import type {
  UserMemory,
  UserMemoryUpsertInput,
  UserPreferences,
  UserSkillEntry,
  UserRecentContext,
} from "@yesboss/types";

const COLLECTION = "user_memory";

interface UserMemoryDocument {
  _id: ObjectId;
  userId: string;
  organizationId: ObjectId;
  preferences: UserPreferences;
  skills: UserSkillEntry[];
  recentContext: UserRecentContext;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection<UserMemoryDocument> {
  return getDb().collection<UserMemoryDocument>(COLLECTION);
}

export async function ensureUserMemoryIndexes(): Promise<void> {
  const col = getCollection();
  await col.createIndex({ userId: 1, organizationId: 1 }, { unique: true });
}

export async function getUserMemory(
  userId: string,
  organizationId: string
): Promise<UserMemoryDocument | null> {
  if (!ObjectId.isValid(organizationId)) return null;
  return getCollection().findOne({ userId, organizationId: new ObjectId(organizationId) });
}

export async function upsertUserMemory(
  input: UserMemoryUpsertInput
): Promise<UserMemoryDocument> {
  const col = getCollection();
  const now = new Date();
  const orgOid = new ObjectId(input.organizationId);

  const existing = await col.findOne({ userId: input.userId, organizationId: orgOid });

  if (!existing) {
    const doc: UserMemoryDocument = {
      _id: new ObjectId(),
      userId: input.userId,
      organizationId: orgOid,
      preferences: input.preferences || {},
      skills: input.skills || [],
      recentContext: {
        recentTaskIds: input.recentContext?.recentTaskIds || [],
        recentProjectIds: input.recentContext?.recentProjectIds || [],
        lastActivityAt: input.recentContext?.lastActivityAt || now,
      },
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    await col.insertOne(doc);
    return doc;
  }

  // Merge: shallow merge prefs, replace skills if provided, merge recentContext.
  const nextPrefs = { ...existing.preferences, ...(input.preferences || {}) };
  const nextRecent: UserRecentContext = {
    recentTaskIds: input.recentContext?.recentTaskIds ?? existing.recentContext.recentTaskIds,
    recentProjectIds:
      input.recentContext?.recentProjectIds ?? existing.recentContext.recentProjectIds,
    lastActivityAt: input.recentContext?.lastActivityAt || now,
  };

  const update: Record<string, unknown> = {
    preferences: nextPrefs,
    recentContext: nextRecent,
    updatedAt: now,
  };
  if (input.skills) update.skills = input.skills;
  if (input.notes !== undefined) update.notes = input.notes;

  const result = await col.findOneAndUpdate(
    { _id: existing._id },
    { $set: update },
    { returnDocument: "after" }
  );
  return result!;
}

/** Push task/project id onto rolling recent list (capped). */
export async function pushRecentActivity(
  userId: string,
  organizationId: string,
  opts: { taskId?: string; projectId?: string; cap?: number }
): Promise<void> {
  if (!ObjectId.isValid(organizationId)) return;
  const cap = opts.cap ?? 20;
  const col = getCollection();
  const orgOid = new ObjectId(organizationId);
  const now = new Date();

  // Ensure doc exists.
  await col.updateOne(
    { userId, organizationId: orgOid },
    {
      $setOnInsert: {
        _id: new ObjectId(),
        userId,
        organizationId: orgOid,
        preferences: {},
        skills: [],
        recentContext: { recentTaskIds: [], recentProjectIds: [], lastActivityAt: now },
        createdAt: now,
      },
      $set: { updatedAt: now, "recentContext.lastActivityAt": now },
    },
    { upsert: true }
  );

  const updates: Record<string, unknown> = {};
  if (opts.taskId) {
    updates["recentContext.recentTaskIds"] = { $each: [opts.taskId], $position: 0, $slice: cap };
  }
  if (opts.projectId) {
    updates["recentContext.recentProjectIds"] = {
      $each: [opts.projectId],
      $position: 0,
      $slice: cap,
    };
  }
  if (Object.keys(updates).length) {
    await col.updateOne({ userId, organizationId: orgOid }, { $push: updates as any });
  }
}

export async function addUserSkill(
  userId: string,
  organizationId: string,
  skill: string,
  delta = 0.1
): Promise<void> {
  if (!ObjectId.isValid(organizationId)) return;
  const col = getCollection();
  const orgOid = new ObjectId(organizationId);
  const existing = await col.findOne({ userId, organizationId: orgOid });

  const now = new Date();
  const skills: UserSkillEntry[] = existing?.skills || [];
  const idx = skills.findIndex((s) => s.skill.toLowerCase() === skill.toLowerCase());
  if (idx >= 0) {
    skills[idx] = {
      ...skills[idx],
      confidence: Math.min(1, (skills[idx].confidence ?? 0.5) + delta),
      lastDemonstrated: now,
    };
  } else {
    skills.push({ skill, confidence: Math.min(1, delta + 0.3), lastDemonstrated: now });
  }

  await col.updateOne(
    { userId, organizationId: orgOid },
    {
      $set: { skills, updatedAt: now },
      $setOnInsert: {
        _id: new ObjectId(),
        userId,
        organizationId: orgOid,
        preferences: {},
        recentContext: { recentTaskIds: [], recentProjectIds: [], lastActivityAt: now },
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";
import type {
  ConversationSession,
  ConversationTurn,
  ActiveIntent,
  PendingConfirmation,
  SessionAppendInput,
} from "@yesboss/types";
import { env } from "../config/env.js";

const COLLECTION = "conversation_sessions";

interface SessionDocument {
  _id: ObjectId;
  phoneE164: string;
  userId?: string;
  organizationId?: ObjectId;
  turns: ConversationTurn[];
  activeIntent?: ActiveIntent;
  pendingConfirmation?: PendingConfirmation;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection<SessionDocument> {
  return getDb().collection<SessionDocument>(COLLECTION);
}

export async function ensureSessionIndexes(): Promise<void> {
  const col = getCollection();
  // Unique session per phone.
  await col.createIndex({ phoneE164: 1 }, { unique: true });
  // TTL on expiresAt.
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

function computeExpiry(hours?: number): Date {
  const h = hours ?? env.SESSION_TTL_HOURS;
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

export async function getSession(phoneE164: string): Promise<SessionDocument | null> {
  return getCollection().findOne({ phoneE164 });
}

export async function appendTurn(input: SessionAppendInput): Promise<SessionDocument> {
  const col = getCollection();
  const now = new Date();
  const maxTurns = input.maxTurns ?? env.SESSION_MAX_TURNS;
  const expiresAt = computeExpiry(input.ttlHours);

  const turn: ConversationTurn = {
    ...input.turn,
    timestamp: input.turn.timestamp || now,
  };

  const setFields: Record<string, unknown> = {
    updatedAt: now,
    expiresAt,
  };
  if (input.userId) setFields.userId = input.userId;
  if (input.organizationId) setFields.organizationId = new ObjectId(input.organizationId);

  // activeIntent/pendingConfirmation: null => clear, undefined => leave alone.
  const unsetFields: Record<string, unknown> = {};
  if (input.activeIntent === null) unsetFields.activeIntent = "";
  else if (input.activeIntent !== undefined) setFields.activeIntent = input.activeIntent;

  if (input.pendingConfirmation === null) unsetFields.pendingConfirmation = "";
  else if (input.pendingConfirmation !== undefined)
    setFields.pendingConfirmation = input.pendingConfirmation;

  const update: Record<string, unknown> = {
    $setOnInsert: {
      _id: new ObjectId(),
      phoneE164: input.phoneE164,
      turns: [],
      createdAt: now,
    },
    $set: setFields,
    $push: { turns: { $each: [turn], $slice: -maxTurns } as any },
  };
  if (Object.keys(unsetFields).length) update.$unset = unsetFields;

  const result = await col.findOneAndUpdate(
    { phoneE164: input.phoneE164 },
    update,
    { upsert: true, returnDocument: "after" }
  );
  return result!;
}

export async function setActiveIntent(
  phoneE164: string,
  intent: ActiveIntent | null
): Promise<void> {
  const col = getCollection();
  const now = new Date();
  if (intent === null) {
    await col.updateOne(
      { phoneE164 },
      { $unset: { activeIntent: "" }, $set: { updatedAt: now, expiresAt: computeExpiry() } }
    );
  } else {
    await col.updateOne(
      { phoneE164 },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          phoneE164,
          turns: [],
          createdAt: now,
        },
        $set: { activeIntent: intent, updatedAt: now, expiresAt: computeExpiry() },
      },
      { upsert: true }
    );
  }
}

export async function setPendingConfirmation(
  phoneE164: string,
  pending: PendingConfirmation | null
): Promise<void> {
  const col = getCollection();
  const now = new Date();
  if (pending === null) {
    await col.updateOne(
      { phoneE164 },
      {
        $unset: { pendingConfirmation: "" },
        $set: { updatedAt: now, expiresAt: computeExpiry() },
      }
    );
  } else {
    await col.updateOne(
      { phoneE164 },
      {
        $setOnInsert: {
          _id: new ObjectId(),
          phoneE164,
          turns: [],
          createdAt: now,
        },
        $set: { pendingConfirmation: pending, updatedAt: now, expiresAt: computeExpiry() },
      },
      { upsert: true }
    );
  }
}

export async function clearSession(phoneE164: string): Promise<boolean> {
  const result = await getCollection().deleteOne({ phoneE164 });
  return result.deletedCount === 1;
}

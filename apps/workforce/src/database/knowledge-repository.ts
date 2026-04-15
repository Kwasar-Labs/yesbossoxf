import { Collection, ObjectId } from "mongodb";
import { getDb } from "./connection.js";
import {
  FactCategory,
  FactSource,
  KnowledgeFact,
  KnowledgeFactCreateInput,
  KnowledgeFactUpdateInput,
  KnowledgeSearchParams,
} from "@yesboss/types";
import { embedOne, cosineSim, isEmbeddingEnabled } from "../services/embedding.js";

const COLLECTION = "knowledge_facts";

interface KnowledgeFactDocument {
  _id: ObjectId;
  organizationId: ObjectId;
  content: string;
  category: string;
  referenceId?: string;
  tags?: string[];
  createdBy?: string;
  source?: string;
  confidence?: number;
  embedding?: number[];
  useCount?: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  supersededBy?: string;
  supersedes?: string;
  createdAt: Date;
  updatedAt: Date;
}

function getCollection(): Collection<KnowledgeFactDocument> {
  return getDb().collection<KnowledgeFactDocument>(COLLECTION);
}

/** Call once at app boot. Creates indexes (including TTL on expiresAt). */
export async function ensureKnowledgeIndexes(): Promise<void> {
  const col = getCollection();
  await col.createIndex({ organizationId: 1, category: 1 });
  await col.createIndex({ organizationId: 1, tags: 1 });
  await col.createIndex({ organizationId: 1, referenceId: 1 });
  await col.createIndex({ content: "text" });
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export async function createFact(input: KnowledgeFactCreateInput): Promise<KnowledgeFactDocument> {
  const collection = getCollection();
  const now = new Date();

  // Attempt embedding generation; non-blocking if disabled/fails.
  const embedding = await embedOne(input.content);

  const doc: KnowledgeFactDocument = {
    _id: new ObjectId(),
    organizationId: new ObjectId(input.organizationId),
    content: input.content,
    category: input.category,
    referenceId: input.referenceId,
    tags: input.tags,
    createdBy: input.createdBy,
    source: input.source || FactSource.USER_TAUGHT,
    confidence: input.confidence ?? (input.source === FactSource.AI_OBSERVED ? 0.5 : 0.9),
    embedding: embedding ?? undefined,
    useCount: 0,
    expiresAt: input.expiresAt,
    supersedes: input.supersedes,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(doc);

  // If this supersedes an older fact, mark the old one.
  if (input.supersedes) {
    await collection.updateOne(
      { _id: new ObjectId(input.supersedes) },
      { $set: { supersededBy: doc._id.toHexString(), updatedAt: now } }
    );
  }

  return doc;
}

export async function getFact(id: string): Promise<KnowledgeFactDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  return getCollection().findOne({ _id: new ObjectId(id) });
}

/**
 * Tokenize query for keyword scoring.
 */
function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
}

/**
 * Hybrid search: embedding cosine + keyword overlap + tag match + confidence.
 * Returns facts sorted by composite score, capped at limit (default 20).
 * Also bumps useCount / lastUsedAt on returned facts (fire-and-forget).
 */
export async function searchFacts(params: KnowledgeSearchParams): Promise<KnowledgeFactDocument[]> {
  const col = getCollection();
  const limit = params.limit ?? 20;
  const minConfidence = params.minConfidence ?? 0;

  const baseFilter: Record<string, unknown> = {
    organizationId: new ObjectId(params.organizationId),
    supersededBy: { $exists: false },
  };
  if (params.category) baseFilter.category = params.category;
  if (params.referenceId) baseFilter.referenceId = params.referenceId;
  if (params.tags && params.tags.length) baseFilter.tags = { $in: params.tags };
  if (minConfidence > 0) baseFilter.confidence = { $gte: minConfidence };

  // No query: return recent facts of org.
  if (!params.q) {
    return col.find(baseFilter).sort({ createdAt: -1 }).limit(limit).toArray();
  }

  const queryTokens = new Set(tokenize(params.q));
  const useEmb = params.useEmbedding !== false && isEmbeddingEnabled();
  const queryEmbedding = useEmb ? await embedOne(params.q) : null;

  // Candidate set — keyword regex or text index. Keep broad, rescore in app.
  const candidateFilter = {
    ...baseFilter,
    $or: [
      { content: { $regex: escapeRegex(params.q), $options: "i" } },
      { tags: { $in: Array.from(queryTokens) } },
    ],
  };

  // If embeddings enabled, don't over-filter — we want the vector to rescue
  // semantic matches that miss the keyword. Pull a bigger candidate pool.
  const candidates: KnowledgeFactDocument[] = queryEmbedding
    ? await col.find(baseFilter).limit(500).toArray()
    : await col.find(candidateFilter).limit(200).toArray();

  const now = Date.now();
  const scored = candidates.map((doc) => {
    const tokens = new Set(tokenize(doc.content));
    const overlap = [...queryTokens].filter((t) => tokens.has(t)).length;
    const keywordScore = queryTokens.size ? overlap / queryTokens.size : 0;

    const tagScore = doc.tags && params.tags
      ? doc.tags.filter((t) => params.tags!.includes(t)).length / Math.max(1, params.tags.length)
      : 0;

    const vectorScore = queryEmbedding && doc.embedding
      ? Math.max(0, cosineSim(queryEmbedding, doc.embedding))
      : 0;

    const confidence = doc.confidence ?? 0.5;

    // Recency: facts used/created in last 30 days get small boost.
    const ageDays = (now - new Date(doc.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - ageDays / 90); // decays to 0 over 90 days

    const composite =
      0.55 * vectorScore +
      0.25 * keywordScore +
      0.1 * tagScore +
      0.05 * confidence +
      0.05 * recencyScore;

    return { doc, composite };
  });

  scored.sort((a, b) => b.composite - a.composite);
  const top = scored.slice(0, limit).filter((s) => s.composite > 0).map((s) => s.doc);

  // Fire-and-forget usage bump.
  if (top.length) {
    void col.updateMany(
      { _id: { $in: top.map((d) => d._id) } },
      { $inc: { useCount: 1 }, $set: { lastUsedAt: new Date() } }
    ).catch(() => {});
  }

  return top;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Back-compat wrapper — old controller signature. */
export async function findFactsByOrg(
  organizationId: string,
  filter?: { category?: string; referenceId?: string; q?: string }
): Promise<KnowledgeFactDocument[]> {
  return searchFacts({
    organizationId,
    q: filter?.q,
    category: filter?.category as FactCategory | undefined,
    referenceId: filter?.referenceId,
  });
}

export async function updateFact(
  id: string,
  input: KnowledgeFactUpdateInput
): Promise<KnowledgeFactDocument | null> {
  if (!ObjectId.isValid(id)) return null;

  const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
  if (input.content !== undefined) {
    updateDoc.content = input.content;
    // Re-embed on content change.
    const emb = await embedOne(input.content);
    if (emb) updateDoc.embedding = emb;
  }
  if (input.category !== undefined) updateDoc.category = input.category;
  if (input.referenceId !== undefined) updateDoc.referenceId = input.referenceId;
  if (input.tags !== undefined) updateDoc.tags = input.tags;
  if (input.confidence !== undefined) updateDoc.confidence = input.confidence;
  if (input.expiresAt !== undefined) updateDoc.expiresAt = input.expiresAt;
  if (input.supersededBy !== undefined) updateDoc.supersededBy = input.supersededBy;

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

/**
 * Backfill embeddings for existing facts that don't have one yet.
 * Safe to call repeatedly; skips facts that already have an embedding.
 */
export async function backfillEmbeddings(organizationId?: string, batchSize = 50): Promise<number> {
  if (!isEmbeddingEnabled()) return 0;
  const col = getCollection();
  const filter: Record<string, unknown> = { embedding: { $exists: false } };
  if (organizationId) filter.organizationId = new ObjectId(organizationId);

  let updated = 0;
  const cursor = col.find(filter).limit(batchSize);
  const docs = await cursor.toArray();
  for (const doc of docs) {
    const emb = await embedOne(doc.content);
    if (!emb) continue;
    await col.updateOne({ _id: doc._id }, { $set: { embedding: emb, updatedAt: new Date() } });
    updated++;
  }
  return updated;
}

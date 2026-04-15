/**
 * Pluggable embedding service.
 *
 * Controlled by env:
 *   EMBEDDING_PROVIDER = openai | voyage | local | none
 *   EMBEDDING_MODEL (default: text-embedding-3-small)
 *   EMBEDDING_API_KEY (or OPENAI_API_KEY)
 *
 * If provider is "none" or API key missing, embed() returns null and callers
 * must fall back to keyword search. This keeps the system runnable without an
 * embedding backend.
 */

import { env } from "../config/env.js";

export type EmbeddingVector = number[];

interface EmbeddingProvider {
  name: string;
  embed(texts: string[]): Promise<EmbeddingVector[]>;
}

class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = "openai";
  constructor(private apiKey: string, private model: string) {}

  async embed(texts: string[]): Promise<EmbeddingVector[]> {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => `HTTP ${res.status}`);
      throw new Error(`OpenAI embedding error: ${res.status} - ${err}`);
    }
    const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return json.data.map((d) => d.embedding);
  }
}

class VoyageEmbeddingProvider implements EmbeddingProvider {
  name = "voyage";
  constructor(private apiKey: string, private model: string) {}
  async embed(texts: string[]): Promise<EmbeddingVector[]> {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ input: texts, model: this.model }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => `HTTP ${res.status}`);
      throw new Error(`Voyage embedding error: ${res.status} - ${err}`);
    }
    const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return json.data.map((d) => d.embedding);
  }
}

let providerInstance: EmbeddingProvider | null | undefined;

function getProvider(): EmbeddingProvider | null {
  if (providerInstance !== undefined) return providerInstance;
  const { EMBEDDING_PROVIDER, EMBEDDING_API_KEY, EMBEDDING_MODEL } = env;
  if (EMBEDDING_PROVIDER === "none" || !EMBEDDING_API_KEY) {
    providerInstance = null;
    console.log("[embedding] disabled (provider=" + EMBEDDING_PROVIDER + ", key=" + (EMBEDDING_API_KEY ? "set" : "missing") + ")");
    return null;
  }
  switch (EMBEDDING_PROVIDER) {
    case "openai":
      providerInstance = new OpenAIEmbeddingProvider(EMBEDDING_API_KEY, EMBEDDING_MODEL);
      break;
    case "voyage":
      providerInstance = new VoyageEmbeddingProvider(EMBEDDING_API_KEY, EMBEDDING_MODEL);
      break;
    default:
      providerInstance = null;
  }
  if (providerInstance) {
    console.log(`[embedding] using ${providerInstance.name} model=${EMBEDDING_MODEL}`);
  }
  return providerInstance;
}

export async function embedOne(text: string): Promise<EmbeddingVector | null> {
  const p = getProvider();
  if (!p) return null;
  try {
    const [vec] = await p.embed([text]);
    return vec ?? null;
  } catch (e) {
    console.error("[embedding] embedOne failed:", (e as Error).message);
    return null;
  }
}

export async function embedBatch(texts: string[]): Promise<(EmbeddingVector | null)[]> {
  const p = getProvider();
  if (!p) return texts.map(() => null);
  try {
    const vecs = await p.embed(texts);
    return vecs;
  } catch (e) {
    console.error("[embedding] embedBatch failed:", (e as Error).message);
    return texts.map(() => null);
  }
}

export function cosineSim(a: EmbeddingVector, b: EmbeddingVector): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function isEmbeddingEnabled(): boolean {
  return getProvider() !== null;
}

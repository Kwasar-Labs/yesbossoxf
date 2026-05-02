import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult, toolErrorFromThrown } from "../tool-result.js";

// --- Learn Fact ---
const LearnFactSchema = Type.Object({
  content: Type.String({ description: "Specific rule, SOP, preference, skill or fact to remember." }),
  category: Type.Union([
    Type.Literal("USER_SKILL"),
    Type.Literal("SOP"),
    Type.Literal("PROJECT_RULE"),
    Type.Literal("LESSON_LEARNED"),
    Type.Literal("PREFERENCE"),
    Type.Literal("PEOPLE"),
    Type.Literal("TERMINOLOGY"),
    Type.Literal("OTHER"),
  ], { description: "Category of the knowledge fact." }),
  reference_id: Type.Optional(Type.String({ description: "Optional User or Project ID this relates to." })),
  tags: Type.Optional(Type.Array(Type.String(), { description: "Tags for indexing." })),
  organization_id: Type.String({ description: "Organization ID" }),
  source: Type.Optional(Type.Union([
    Type.Literal("USER_TAUGHT"),
    Type.Literal("AI_OBSERVED"),
    Type.Literal("IMPORTED"),
  ], { description: "Where this fact came from. Defaults USER_TAUGHT." })),
  confidence: Type.Optional(Type.Number({ description: "0..1 confidence. Default 0.9 for user-taught, 0.5 for AI-observed." })),
  expires_at: Type.Optional(Type.String({ description: "ISO date after which the fact is auto-deleted." })),
  supersedes: Type.Optional(Type.String({ description: "ID of an older fact this replaces." })),
});

export function createLearnFactTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_learn_fact",
    label: "Learn Fact",
    description:
      "Store a fact (SOP, skill, rule, preference, jargon, lesson) into the org knowledge base. Call when user teaches something or you observe a persistent pattern.",
    parameters: LearnFactSchema,
    execute: async (_toolCallId: string, raw: Record<string, unknown>) => {
      try {
        const body: Record<string, unknown> = {
          organizationId: raw.organization_id,
          content: raw.content,
          category: raw.category,
        };
        if (raw.reference_id) body.referenceId = raw.reference_id;
        if (raw.tags) body.tags = raw.tags;
        if (raw.source) body.source = raw.source;
        if (raw.confidence !== undefined) body.confidence = raw.confidence;
        if (raw.expires_at) body.expiresAt = raw.expires_at;
        if (raw.supersedes) body.supersedes = raw.supersedes;
        const result = await callYesBossApi("POST", "/workforce/knowledge", body, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

// --- Search Knowledge ---
const SearchKnowledgeSchema = Type.Object({
  q: Type.Optional(Type.String({ description: "Semantic / keyword query. Hybrid-scored if embeddings available." })),
  category: Type.Optional(Type.String({ description: "Filter by category." })),
  reference_id: Type.Optional(Type.String({ description: "Filter by Project or User ID." })),
  tags: Type.Optional(Type.Array(Type.String(), { description: "Filter by tags." })),
  organization_id: Type.String({ description: "Organization ID" }),
  limit: Type.Optional(Type.Number({ description: "Max results. Default 20." })),
  min_confidence: Type.Optional(Type.Number({ description: "0..1 min confidence filter." })),
});

export function createSearchKnowledgeTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_search_knowledge",
    label: "Search Knowledge",
    description:
      "Query the org knowledge base (SOPs, skills, preferences, rules, jargon, lessons). Always call BEFORE acting on ambiguous intent. Hybrid scored — semantic + keyword + tags + confidence + recency.",
    parameters: SearchKnowledgeSchema,
    execute: async (_toolCallId: string, raw: Record<string, unknown>) => {
      try {
        const p = new URLSearchParams();
        p.set("organizationId", String(raw.organization_id));
        if (raw.q) p.set("q", String(raw.q));
        if (raw.category) p.set("category", String(raw.category));
        if (raw.reference_id) p.set("referenceId", String(raw.reference_id));
        if (raw.limit !== undefined) p.set("limit", String(raw.limit));
        if (raw.min_confidence !== undefined) p.set("minConfidence", String(raw.min_confidence));
        if (raw.tags && Array.isArray(raw.tags) && raw.tags.length) {
          p.set("tags", raw.tags.join(","));
        }
        const result = await callYesBossApi("GET", `/workforce/knowledge/search?${p.toString()}`, undefined, config);
        return toolResult(result);
      } catch (err) {
        return toolErrorFromThrown(err);
      }
    },
  };
}

import { Type } from "@sinclair/typebox";
import { callYesBossApi } from "../yesboss-client.js";
import { toolResult } from "../tool-result.js";

// --- Learn Fact ---
const LearnFactSchema = Type.Object({
  content: Type.String({ description: "The specific rule, SOP, preference or fact to remember" }),
  category: Type.Union([
    Type.Literal("USER_SKILL"), 
    Type.Literal("SOP"), 
    Type.Literal("PROJECT_RULE"), 
    Type.Literal("LESSON_LEARNED"), 
    Type.Literal("OTHER")
  ], { description: "Category of the knowledge fact" }),
  reference_id: Type.Optional(Type.String({ description: "Optional ID of a User or Project this relates to" })),
  tags: Type.Optional(Type.Array(Type.String(), { description: "Tags to categorize this fact" })),
  organization_id: Type.String({ description: "Organization ID" }),
}, { additionalProperties: false });

export function createLearnFactTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_learn_fact",
    label: "Learn Fact",
    description: "Store a new important fact, SOP, user skill, or rule into the Knowledge Base for future semantic retrieval. Call this whenever you observe a persistent pattern or user asks you to remember something.",
    parameters: LearnFactSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const body: Record<string, unknown> = {
        organizationId: rawParams.organization_id,
        content: rawParams.content,
        category: rawParams.category
      };
      if (rawParams.reference_id) body.referenceId = rawParams.reference_id;
      if (rawParams.tags) body.tags = rawParams.tags;

      const result = await callYesBossApi("POST", "/workforce/knowledge", body, config);
      return toolResult(result);
    },
  };
}

// --- Search Knowledge ---
const SearchKnowledgeSchema = Type.Object({
  q: Type.Optional(Type.String({ description: "Semantic or keyword query to search for (e.g. 'who knows React' or 'vacation policy')" })),
  category: Type.Optional(Type.String({ description: "Filter by category" })),
  reference_id: Type.Optional(Type.String({ description: "Filter by specific Project or User ID" })),
  organization_id: Type.String({ description: "Organization ID" }),
}, { additionalProperties: false });

export function createSearchKnowledgeTool(config?: { apiUrl?: string; apiKey?: string }) {
  return {
    name: "yesboss_search_knowledge",
    label: "Search Knowledge",
    description: "Query the Knowledge Base for SOPs, rules, skills, and past lessons. Use this before creating tasks or when uncertain about standard procedures.",
    parameters: SearchKnowledgeSchema,
    execute: async (_toolCallId: string, rawParams: Record<string, unknown>) => {
      const q = rawParams.q ? `?q=${encodeURIComponent(String(rawParams.q))}` : "";
      let url = "/workforce/knowledge/search" + q;
      
      if (rawParams.category) {
        url += (q ? "&" : "?") + "category=" + encodeURIComponent(String(rawParams.category));
      }
      if (rawParams.reference_id) {
        url += (url.includes('?') ? "&" : "?") + "referenceId=" + encodeURIComponent(String(rawParams.reference_id));
      }
      url += (url.includes('?') ? "&" : "?") + "organizationId=" + encodeURIComponent(String(rawParams.organization_id));

      const result = await callYesBossApi("GET", url, undefined, config);
      return toolResult(result);
    },
  };
}
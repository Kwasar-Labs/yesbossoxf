import type { Timestamps } from "./common.js";
import type { FactCategory, FactSource } from "./enums/fact-category.js";

export interface KnowledgeFact extends Timestamps {
  _id: string;
  organizationId: string;
  content: string;
  category: FactCategory;
  referenceId?: string;
  tags?: string[];
  createdBy?: string;
  // Enhanced fields for semantic KB
  source?: FactSource;
  confidence?: number; // 0..1
  embedding?: number[];
  useCount?: number;
  lastUsedAt?: Date;
  expiresAt?: Date;
  supersededBy?: string;
  supersedes?: string;
}

export interface KnowledgeFactCreateInput {
  organizationId: string;
  content: string;
  category: FactCategory;
  referenceId?: string;
  tags?: string[];
  createdBy?: string;
  source?: FactSource;
  confidence?: number;
  expiresAt?: Date;
  supersedes?: string;
}

export interface KnowledgeFactUpdateInput {
  content?: string;
  category?: FactCategory;
  referenceId?: string;
  tags?: string[];
  confidence?: number;
  expiresAt?: Date;
  supersededBy?: string;
}

export interface KnowledgeSearchParams {
  organizationId: string;
  q?: string;
  category?: FactCategory;
  referenceId?: string;
  tags?: string[];
  limit?: number;
  minConfidence?: number;
  useEmbedding?: boolean;
}

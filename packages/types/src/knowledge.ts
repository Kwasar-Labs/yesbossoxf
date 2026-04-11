import type { Timestamps } from "./common.js";
import type { FactCategory } from "./enums/fact-category.js";

export interface KnowledgeFact extends Timestamps {
  _id: string;
  organizationId: string;
  content: string;
  category: FactCategory;
  referenceId?: string;
  tags?: string[];
  createdBy?: string;
}

export interface KnowledgeFactCreateInput {
  organizationId: string;
  content: string;
  category: FactCategory;
  referenceId?: string;
  tags?: string[];
  createdBy?: string;
}

export interface KnowledgeFactUpdateInput {
  content?: string;
  category?: FactCategory;
  referenceId?: string;
  tags?: string[];
}
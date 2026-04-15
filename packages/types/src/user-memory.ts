import type { Timestamps } from "./common.js";

export interface UserPreferences {
  communicationStyle?: "concise" | "detailed" | "formal" | "casual";
  preferredHours?: { start: string; end: string }; // "09:00"-"18:00"
  timezone?: string;
  language?: string;
  notificationChannels?: string[];
  [key: string]: unknown;
}

export interface UserSkillEntry {
  skill: string;
  confidence: number; // 0..1, derived from completed tasks/tags
  lastDemonstrated?: Date;
}

export interface UserRecentContext {
  recentTaskIds: string[]; // rolling last N
  recentProjectIds: string[];
  lastActivityAt?: Date;
}

export interface UserMemory extends Timestamps {
  _id: string;
  userId: string;
  organizationId: string;
  preferences: UserPreferences;
  skills: UserSkillEntry[];
  recentContext: UserRecentContext;
  notes?: string; // freeform AI-maintained summary
}

export interface UserMemoryUpsertInput {
  userId: string;
  organizationId: string;
  preferences?: Partial<UserPreferences>;
  skills?: UserSkillEntry[];
  recentContext?: Partial<UserRecentContext>;
  notes?: string;
}

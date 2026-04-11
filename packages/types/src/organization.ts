import type { Timestamps } from "./common.js";

export interface Organization extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface OrganizationCreateInput {
  name: string;
  description?: string;
}

export interface OrganizationUpdateInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

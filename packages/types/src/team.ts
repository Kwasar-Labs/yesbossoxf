import type { Timestamps } from "./common.js";

export interface Team extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  memberIds: string[];
  leadId?: string;
  isActive: boolean;
}

export interface TeamCreateInput {
  name: string;
  description?: string;
  leadId?: string;
  memberIds?: string[];
}

export interface TeamUpdateInput {
  name?: string;
  description?: string;
  leadId?: string;
  isActive?: boolean;
}

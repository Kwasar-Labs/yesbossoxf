import type { Timestamps } from "./common.js";
import type { ProjectStatus } from "./enums/index.js";

export interface Project extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  status: ProjectStatus;
  ownerIds: string[];
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  ownerIds?: string[];
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  ownerIds?: string[];
}

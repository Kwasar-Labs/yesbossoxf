import type { Timestamps } from "./common.js";

export interface Assignment extends Timestamps {
  _id: string;
  taskId: string;
  userId: string;
  assignedBy: string;
  organizationId: string;
}

export interface AssignmentCreateInput {
  taskId: string;
  userId: string;
}

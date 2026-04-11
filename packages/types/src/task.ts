import type { Timestamps } from "./common.js";
import type { TaskStatus } from "./enums/index.js";
import type { Priority } from "./enums/index.js";

export interface Task extends Timestamps {
  _id: string;
  title: string;
  description?: string;
  projectId?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate?: Date;
  createdBy: string;
  tags: string[];
  organizationId: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  projectId?: string;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  projectId?: string;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
}

export interface TaskStatusUpdateInput {
  status: TaskStatus;
}

export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  page?: number;
  limit?: number;
}

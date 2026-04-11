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
  reminders?: Date[];
  recurrenceRule?: string;
  activity?: any[];
  comments?: any[];
  subtasks?: any[];
  followUpDate?: Date;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  projectId?: string;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
  reminders?: string[];
  recurrenceRule?: string;
  followUpDate?: string;
  activity?: any[];
  comments?: any[];
  subtasks?: any[];
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  projectId?: string;
  assigneeId?: string;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
  reminders?: string[];
  recurrenceRule?: string;
  followUpDate?: string;
  subtasks?: any[];
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

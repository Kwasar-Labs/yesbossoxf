"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import type {
  Task, TaskCreateInput, TaskUpdateInput, TaskStatusUpdateInput,
  TaskFilters, PaginatedResponse,
} from "@/types";
import { TaskStatus } from "@/types";

interface TaskState {
  tasks: Task[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;

  setFilters: (filters: TaskFilters) => void;
  fetchTasks: (filters?: TaskFilters | Record<string, string>, silent?: boolean) => Promise<void>;
  createTask: (input: TaskCreateInput) => Promise<Task>;
  updateTask: (id: string, input: TaskUpdateInput) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  unassignTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  total: 0,
  isLoading: false,
  error: null,
  filters: {},

  setFilters: (filters) => set({ filters }),

  fetchTasks: async (filters, silent = false) => {
    const f = filters ?? get().filters;
    if (!silent) set({ isLoading: true, error: null });
    try {
      let params: Record<string, string>;
      if (f && typeof Object.values(f)[0] === "string") {
        // Already a Record<string, string>
        params = f as Record<string, string>;
      } else {
        // TaskFilters object
        const tf = f as TaskFilters;
        params = {};
        if (tf.projectId) params.projectId = tf.projectId;
        if (tf.assigneeId) params.assigneeId = tf.assigneeId;
        if (tf.status) params.status = tf.status;
        if (tf.priority) params.priority = tf.priority;
        if (tf.page) params.page = String(tf.page);
        if (tf.limit) params.limit = String(tf.limit);
      }

      const res = await apiClient.get<PaginatedResponse<Task>>("/workforce/tasks", params);
      set({ tasks: res.data, total: res.total, isLoading: false });
    } catch (err) {
      set({ error: (err instanceof Error ? err.message : "Failed to fetch tasks"), isLoading: false });
    }
  },

  createTask: async (input) => {
    const task = await apiClient.post<{ data: Task }>("/workforce/tasks", input);
    await get().fetchTasks();
    return task.data;
  },

  updateTask: async (id, input) => {
    const res = await apiClient.patch<{ data: Task }>(`/workforce/tasks/${id}`, input);
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? res.data : t)),
    }));
    return res.data;
  },

  updateTaskStatus: async (id, status) => {
    const res = await apiClient.patch<{ data: Task }>(`/workforce/tasks/${id}/status`, { status });
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? res.data : t)),
    }));
    return res.data;
  },

  deleteTask: async (id) => {
    await apiClient.delete(`/workforce/tasks/${id}`);
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }));
  },

  assignTask: async (taskId, userId) => {
    await apiClient.post(`/workforce/tasks/${taskId}/assign`, { userId });
    await get().fetchTasks();
  },

  unassignTask: async (taskId) => {
    await apiClient.post(`/workforce/tasks/${taskId}/unassign`, {});
    await get().fetchTasks();
  },
}));

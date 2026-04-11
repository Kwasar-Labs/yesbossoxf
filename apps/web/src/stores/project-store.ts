"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import type { Project, ProjectCreateInput, ProjectUpdateInput, ApiResponse } from "@/types";

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (input: ProjectCreateInput) => Promise<Project>;
  updateProject: (id: string, input: ProjectUpdateInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<{ data: Project[] }>("/workforce/projects");
      set({ projects: res.data, isLoading: false });
    } catch (err) {
      set({ error: (err instanceof Error ? err.message : "Failed to fetch projects"), isLoading: false });
    }
  },

  createProject: async (input) => {
    const res = await apiClient.post<ApiResponse<Project>>("/workforce/projects", input);
    await get().fetchProjects();
    return res.data;
  },

  updateProject: async (id, input) => {
    const res = await apiClient.patch<ApiResponse<Project>>(`/workforce/projects/${id}`, input);
    set((s) => ({
      projects: s.projects.map((p) => (p._id === id ? res.data : p)),
    }));
    return res.data;
  },

  deleteProject: async (id) => {
    await apiClient.delete(`/workforce/projects/${id}`);
    set((s) => ({ projects: s.projects.filter((p) => p._id !== id) }));
  },
}));

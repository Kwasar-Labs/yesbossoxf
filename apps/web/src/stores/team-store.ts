"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import type { Team, TeamCreateInput, TeamUpdateInput } from "@yesboss/types";

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;

  fetchTeams: (silent?: boolean) => Promise<void>;
  createTeam: (input: TeamCreateInput) => Promise<Team>;
  updateTeam: (id: string, input: TeamUpdateInput) => Promise<Team>;
  addMember: (teamId: string, memberId: string) => Promise<void>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  isLoading: false,
  error: null,

  fetchTeams: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>("/auth/teams");
      const items = response.data?.data?.items || response.data?.data || response.data || [];
      set({ teams: Array.isArray(items) ? items : [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTeam: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<any>("/auth/teams", input);
      const newTeam = response.data?.data || response.data;
      set((state) => ({ teams: [...state.teams, newTeam], isLoading: false }));
      return newTeam;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTeam: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<any>(`/auth/teams/${id}`, input);
      const updated = response.data?.data || response.data;
      set((state) => ({
        teams: state.teams.map((t) => (t._id === id ? updated : t)),
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addMember: async (teamId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<any>(`/auth/teams/${teamId}/members`, { memberId });
      const updated = response.data?.data || response.data;
      set((state) => ({
        teams: state.teams.map((t) => (t._id === teamId ? updated : t)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  removeMember: async (teamId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete<any>(`/auth/teams/${teamId}/members`, { memberId });
      const updated = response.data?.data || response.data;
      set((state) => ({
        teams: state.teams.map((t) => (t._id === teamId ? updated : t)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

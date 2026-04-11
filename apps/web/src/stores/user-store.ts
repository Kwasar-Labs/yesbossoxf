"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import type { User, UserCreateInput, UserUpdateInput } from "@yesboss/types";

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: (silent?: boolean) => Promise<void>;
  createUser: (input: UserCreateInput) => Promise<User>;
  updateUser: (id: string, input: UserUpdateInput) => Promise<User>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async (silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>("/auth/users");
      const items = response.data?.data?.items || response.data?.data || response.data || [];
      set({ users: Array.isArray(items) ? items : [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createUser: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<any>("/auth/users", input);
      const newUser = response.data?.data || response.data;
      set((state) => ({ users: [...state.users, newUser], isLoading: false }));
      return newUser;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateUser: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<any>(`/auth/users/${id}`, input);
      const updated = response.data?.data || response.data;
      set((state) => ({
        users: state.users.map((u) => (u._id === id ? updated : u)),
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

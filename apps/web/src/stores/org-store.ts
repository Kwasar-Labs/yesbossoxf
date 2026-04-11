"use client";

import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import type { Organization, OrganizationUpdateInput } from "@yesboss/types";

interface OrgState {
  currentOrg: Organization | null;
  isLoading: boolean;
  error: string | null;

  fetchOrganization: (id: string, silent?: boolean) => Promise<void>;
  updateOrganization: (id: string, input: OrganizationUpdateInput) => Promise<Organization>;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  isLoading: false,
  error: null,

  fetchOrganization: async (id, silent = false) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>(`/auth/organizations/${id}`);
      const org = response.data?.data || response.data;
      set({ currentOrg: org, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateOrganization: async (id, input) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch<any>(`/auth/organizations/${id}`, input);
      const updated = response.data?.data || response.data;
      set({ currentOrg: updated, isLoading: false });
      return updated;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

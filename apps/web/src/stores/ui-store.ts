import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  chatOpen: boolean;

  toggleSidebar: () => void;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  chatOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
}));

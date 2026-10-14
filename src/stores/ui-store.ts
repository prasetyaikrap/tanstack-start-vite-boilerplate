import { createGlobalStore } from "@/providers/zustand";

// Example global store: app-wide UI preferences, saved in localStorage
type UIState = {
	sidebarCollapsed: boolean;
	toggleSidebar: (collapsed?: boolean) => void;
};

export const useUIStore = createGlobalStore<UIState>(
	(set) => ({
		sidebarCollapsed: false,
		toggleSidebar: (collapsed) =>
			set((state) => ({
				sidebarCollapsed: collapsed ?? !state.sidebarCollapsed,
			})),
	}),
	{
		name: "ui",
		// Save only the preference, not the actions
		persist: { partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }) },
	},
);

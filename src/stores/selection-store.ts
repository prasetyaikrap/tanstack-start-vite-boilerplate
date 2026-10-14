import { createContextStore } from "@/providers/zustand";

// Example context store: rows selected in one table. Each <selectionStore.StoreProvider> has its own selection,
// so two tables on a page (or two users during SSR) never share it
type SelectionState = {
	selectedIds: string[];
	toggle: (id: string) => void;
	clear: () => void;
};

type SelectionInitialState = {
	selectedIds?: string[];
};

export const selectionStore = createContextStore<
	SelectionState,
	SelectionInitialState
>("selection", ({ selectedIds = [] }) => (set) => ({
	selectedIds,
	toggle: (id) =>
		set((state) => ({
			selectedIds: state.selectedIds.includes(id)
				? state.selectedIds.filter((selectedId) => selectedId !== id)
				: [...state.selectedIds, id],
		})),
	clear: () => set({ selectedIds: [] }),
}));

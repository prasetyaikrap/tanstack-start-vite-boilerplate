import {
	createContext,
	createElement,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	create,
	createStore,
	type StateCreator,
	type StoreApi,
	type UseBoundStore,
	useStore,
} from "zustand";
import {
	createJSONStorage,
	devtools,
	type PersistOptions,
	persist,
} from "zustand/middleware";
import { ENVS } from "@/configs/envs";

export { useShallow } from "zustand/shallow";

const isDevelopment = ENVS.APP_ENV === "development";

export type PersistConfig<TState> = {
	/** Where to save. Defaults to "local" */
	storage?: "local" | "session";
	/** Saves only part of the state, e.g. preferences but not loading flags */
	partialize?: (state: TState) => Partial<TState>;
	/** Bump when the saved shape changes, and handle old data in migrate */
	version?: number;
	migrate?: PersistOptions<TState, Partial<TState>>["migrate"];
};

export type GlobalStoreOptions<TState> = {
	/** Shown in Redux DevTools and used for the storage key */
	name: string;
	/** Saves the store in the browser and restores it after the first render */
	persist?: PersistConfig<TState>;
};

type PersistedStore = { persist: { rehydrate: () => Promise<void> | void } };

const persistedStores: PersistedStore[] = [];

/**
 * Creates an app-wide store, for client state such as UI preferences.
 *
 * During SSR every request shares this module, so never put per-user data in a global store — use
 * createContextStore for that. Persisted stores render their initial state on the server and on the first client
 * render (so hydration matches), then load the saved state once `rehydratePersistedStores()` runs.
 *
 * @example
 * export const useUIStore = createGlobalStore<UIState>(
 *   (set) => ({
 *     sidebarCollapsed: false,
 *     toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
 *   }),
 *   { name: "ui", persist: { partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }) } },
 * );
 */
export function createGlobalStore<TState>(
	initializer: StateCreator<TState>,
	options: GlobalStoreOptions<TState>,
): UseBoundStore<StoreApi<TState>> {
	let creator = initializer;

	if (options.persist) {
		const { storage = "local", partialize, version, migrate } = options.persist;
		const browserStorage = createJSONStorage<Partial<TState>>(() =>
			storage === "session" ? sessionStorage : localStorage,
		);

		// zustand saves on every update, even before the saved state is loaded. An update made on mount (before
		// rehydratePersistedStores runs) would overwrite the user's saved state, so writes wait until it is loaded
		let isHydrated = false;

		creator = persist<TState, [], [], Partial<TState>>(creator, {
			name: `${ENVS.APP_ID.toLowerCase()}_${options.name}`,
			storage: browserStorage && {
				...browserStorage,
				setItem: (name, value) =>
					isHydrated ? browserStorage.setItem(name, value) : undefined,
			},
			skipHydration: true,
			onRehydrateStorage: () => () => {
				isHydrated = true;
			},
			// Only set what is configured: an explicit undefined would override zustand's defaults
			// (version 0, partialize = whole state) and make saved state look like it needs a migration
			...(partialize && { partialize }),
			...(version !== undefined && { version }),
			...(migrate && { migrate }),
		}) as unknown as StateCreator<TState>;
	}

	creator = devtools(creator, {
		name: options.name,
		enabled: isDevelopment,
	}) as unknown as StateCreator<TState>;

	const useBoundStore = create<TState>()(creator);

	if (options.persist) {
		persistedStores.push(useBoundStore as unknown as PersistedStore);
	}

	return useBoundStore;
}

/** Loads the saved state of every persisted global store. Call once in the browser, after the first render */
export async function rehydratePersistedStores() {
	await Promise.all(persistedStores.map((store) => store.persist.rehydrate()));
}

/** Runs rehydratePersistedStores after the first render. Used once in AppProviders */
export function usePersistedStoresHydration() {
	useEffect(() => {
		void rehydratePersistedStores();
	}, []);
}

type StoreProviderProps<TInitialState> = {
	children: ReactNode;
	initialState: TInitialState;
};

/**
 * Creates a store per provider instance: one per request on the server, one per mounted provider in the browser.
 * Use it for state that belongs to a user, a page or a component tree, especially when it starts from server data.
 *
 * @example
 * export const selectionStore = createContextStore<SelectionState, { selectedIds: string[] }>(
 *   "selection",
 *   ({ selectedIds }) => (set) => ({
 *     selectedIds,
 *     toggle: (id) => set((state) => ({ selectedIds: ... })),
 *   }),
 * );
 *
 * <selectionStore.StoreProvider initialState={{ selectedIds: [] }}>...</selectionStore.StoreProvider>
 * const selectedIds = selectionStore.useStore((state) => state.selectedIds);
 */
export function createContextStore<TState, TInitialState = Partial<TState>>(
	name: string,
	initializer: (initialState: TInitialState) => StateCreator<TState>,
) {
	const StoreContext = createContext<StoreApi<TState> | null>(null);

	function StoreProvider({
		children,
		initialState,
	}: StoreProviderProps<TInitialState>) {
		// Created once per provider instance, so concurrent requests never share state
		const [store] = useState(() =>
			createStore<TState>()(
				devtools(initializer(initialState), {
					name,
					enabled: isDevelopment,
				}) as unknown as StateCreator<TState>,
			),
		);

		return createElement(StoreContext.Provider, { value: store }, children);
	}

	function useStoreApi(): StoreApi<TState> {
		const store = useContext(StoreContext);
		if (!store) {
			throw new Error(`The "${name}" store is used outside its StoreProvider`);
		}

		return store;
	}

	function useContextStore<TSelected>(
		selector: (state: TState) => TSelected,
	): TSelected {
		return useStore(useStoreApi(), selector);
	}

	return {
		StoreProvider,
		/** Selects from the nearest provider's store. Use useShallow when selecting several fields */
		useStore: useContextStore,
		/** The raw store, for reading or writing outside render (e.g. in event handlers) */
		useStoreApi,
	};
}

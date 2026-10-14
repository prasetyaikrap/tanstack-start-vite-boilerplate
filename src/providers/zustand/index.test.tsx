import { act, render, renderHook, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
	createContextStore,
	createGlobalStore,
	rehydratePersistedStores,
	usePersistedStoresHydration,
	useShallow,
} from ".";

const STORAGE_PREFIX = "tanstack-vite-boilerplate_";

type CounterState = {
	count: number;
	label: string;
	increment: () => void;
};

const counter = (
	set: (fn: (state: CounterState) => Partial<CounterState>) => void,
) => ({
	count: 0,
	label: "counter",
	increment: () => set((state) => ({ count: state.count + 1 })),
});

beforeEach(() => {
	localStorage.clear();
	sessionStorage.clear();
});

describe("createGlobalStore", () => {
	it("holds state and actions, and re-renders selectors", () => {
		const useCounter = createGlobalStore<CounterState>(counter, {
			name: "plain",
		});
		const { result } = renderHook(() => useCounter((state) => state.count));

		act(() => useCounter.getState().increment());

		expect(result.current).toBe(1);
	});

	it("saves only the partialized state under a prefixed key", async () => {
		const useCounter = createGlobalStore<CounterState>(counter, {
			name: "saved-counter",
			persist: { partialize: ({ count }) => ({ count }) },
		});

		await act(() => rehydratePersistedStores());
		act(() => useCounter.getState().increment());

		const saved = JSON.parse(
			localStorage.getItem(`${STORAGE_PREFIX}saved-counter`) ?? "{}",
		);
		expect(saved.state).toEqual({ count: 1 });
	});

	it("saves the whole state when persisted without partialize", async () => {
		const useCounter = createGlobalStore<CounterState>(counter, {
			name: "whole-counter",
			persist: {},
		});

		await act(() => rehydratePersistedStores());
		act(() => useCounter.getState().increment());

		const saved = JSON.parse(
			localStorage.getItem(`${STORAGE_PREFIX}whole-counter`) ?? "{}",
		);
		expect(saved).toEqual({
			state: { count: 1, label: "counter" },
			version: 0,
		});
	});

	it("does not overwrite saved state with updates made before it is loaded", async () => {
		const key = `${STORAGE_PREFIX}early-counter`;
		localStorage.setItem(
			key,
			JSON.stringify({ state: { count: 5 }, version: 0 }),
		);
		const useCounter = createGlobalStore<CounterState>(counter, {
			name: "early-counter",
			persist: { partialize: ({ count }) => ({ count }) },
		});

		// e.g. a layout effect that runs before AppProviders rehydrates
		act(() => useCounter.getState().increment());
		expect(JSON.parse(localStorage.getItem(key) ?? "{}").state).toEqual({
			count: 5,
		});

		await act(() => rehydratePersistedStores());
		expect(useCounter.getState().count).toBe(5);

		act(() => useCounter.getState().increment());
		expect(JSON.parse(localStorage.getItem(key) ?? "{}").state).toEqual({
			count: 6,
		});
	});

	it("migrates state saved with an older version", async () => {
		localStorage.setItem(
			`${STORAGE_PREFIX}migrated-counter`,
			JSON.stringify({ state: { total: 7 }, version: 1 }),
		);
		const useCounter = createGlobalStore<CounterState>(counter, {
			name: "migrated-counter",
			persist: {
				version: 2,
				migrate: (saved, version) =>
					version === 1
						? { count: (saved as { total: number }).total }
						: (saved as Partial<CounterState>),
			},
		});

		await act(() => rehydratePersistedStores());

		expect(useCounter.getState().count).toBe(7);
	});

	it("keeps the initial state until rehydrated, so SSR and the first client render match", async () => {
		localStorage.setItem(
			`${STORAGE_PREFIX}restored-counter`,
			JSON.stringify({ state: { count: 5 }, version: 0 }),
		);
		const useCounter = createGlobalStore<CounterState>(counter, {
			name: "restored-counter",
			persist: {},
		});
		const Count = () => <span>{useCounter((state) => state.count)}</span>;

		expect(renderToString(<Count />)).toContain(">0<");
		expect(useCounter.getState().count).toBe(0);

		await act(() => rehydratePersistedStores());

		expect(useCounter.getState().count).toBe(5);
		expect(useCounter.getState().label).toBe("counter");
	});

	it("rehydrates after mount with usePersistedStoresHydration", async () => {
		sessionStorage.setItem(
			`${STORAGE_PREFIX}session-counter`,
			JSON.stringify({ state: { count: 3 }, version: 0 }),
		);
		const useCounter = createGlobalStore<CounterState>(counter, {
			name: "session-counter",
			persist: { storage: "session" },
		});

		await act(async () => {
			renderHook(() => usePersistedStoresHydration());
		});

		expect(useCounter.getState().count).toBe(3);
	});
});

describe("createContextStore", () => {
	type SelectionState = {
		selectedIds: string[];
		toggle: (id: string) => void;
	};

	const selection = createContextStore<
		SelectionState,
		{ selectedIds?: string[] }
	>("selection-test", ({ selectedIds = [] }) => (set) => ({
		selectedIds,
		toggle: (id) =>
			set((state) => ({
				selectedIds: state.selectedIds.includes(id)
					? state.selectedIds.filter((selected) => selected !== id)
					: [...state.selectedIds, id],
			})),
	}));

	function Selection({ testId }: { testId: string }) {
		const { selectedIds, toggle } = selection.useStore(
			useShallow((state) => ({
				selectedIds: state.selectedIds,
				toggle: state.toggle,
			})),
		);
		return (
			<button
				type="button"
				data-testid={testId}
				onClick={() => toggle("row-1")}
			>
				{selectedIds.join(",") || "none"}
			</button>
		);
	}

	it("starts from initialState and gives each provider its own store", () => {
		render(
			<>
				<selection.StoreProvider initialState={{ selectedIds: ["row-9"] }}>
					<Selection testId="first" />
				</selection.StoreProvider>
				<selection.StoreProvider initialState={{}}>
					<Selection testId="second" />
				</selection.StoreProvider>
			</>,
		);

		expect(screen.getByTestId("first").textContent).toBe("row-9");
		expect(screen.getByTestId("second").textContent).toBe("none");

		act(() => screen.getByTestId("second").click());

		expect(screen.getByTestId("first").textContent).toBe("row-9");
		expect(screen.getByTestId("second").textContent).toBe("row-1");
	});

	it("does not share state between server renders", () => {
		const Toggle = () => {
			const toggle = selection.useStore((state) => state.toggle);
			const ids = selection.useStore((state) => state.selectedIds);
			if (ids.length === 0) toggle("leaked");
			return <span>{ids.join(",")}</span>;
		};
		const renderRequest = () =>
			renderToString(
				<selection.StoreProvider initialState={{}}>
					<Toggle />
				</selection.StoreProvider>,
			);

		renderRequest();
		expect(renderRequest()).not.toContain("leaked,leaked");
	});

	it("throws a clear error outside its provider", () => {
		expect(() =>
			renderHook(() => selection.useStore((state) => state.selectedIds)),
		).toThrow('The "selection-test" store is used outside its StoreProvider');
	});
});

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { rehydratePersistedStores } from "@/providers/zustand";
import { useUIStore } from "@/stores/ui-store";
import { useSidebarCollapse } from "./useSidebarCollapse";

const STORAGE_KEY = "tanstack-vite-boilerplate_ui";

// jsdom has no matchMedia: a controllable mock that also fires "change" like a real resize
let smallScreen = false;
const mediaListeners = new Set<
	(event: { media: string; matches: boolean }) => void
>();

window.matchMedia = ((media: string) => ({
	media,
	get matches() {
		return smallScreen;
	},
	addEventListener: (
		_: string,
		listener: (event: { media: string; matches: boolean }) => void,
	) => mediaListeners.add(listener),
	removeEventListener: (
		_: string,
		listener: (event: { media: string; matches: boolean }) => void,
	) => mediaListeners.delete(listener),
})) as unknown as typeof window.matchMedia;

function resize(toSmallScreen: boolean) {
	smallScreen = toSmallScreen;
	act(() => {
		for (const listener of mediaListeners) {
			listener({ media: "(max-width: 768px)", matches: toSmallScreen });
		}
	});
}

const savedPreference = () =>
	JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").state;

beforeEach(async () => {
	smallScreen = false;
	mediaListeners.clear();
	localStorage.clear();
	await rehydratePersistedStores();
	act(() => useUIStore.setState({ sidebarCollapsed: false }));
});

describe("useSidebarCollapse", () => {
	it("saves the preference on large screens", () => {
		const { result } = renderHook(() => useSidebarCollapse());
		expect(result.current.collapsed).toBe(false);

		act(() => result.current.toggleCollapsed());

		expect(result.current.collapsed).toBe(true);
		expect(savedPreference()).toEqual({ sidebarCollapsed: true });
	});

	it("restores the saved preference after a reload", async () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ state: { sidebarCollapsed: true }, version: 0 }),
		);

		const { result } = renderHook(() => useSidebarCollapse());
		await act(() => rehydratePersistedStores());

		expect(result.current.collapsed).toBe(true);
	});

	it("starts collapsed on small screens without changing the saved preference", () => {
		smallScreen = true;
		const { result } = renderHook(() => useSidebarCollapse());

		expect(result.current.collapsed).toBe(true);

		act(() => result.current.toggleCollapsed());
		expect(result.current.collapsed).toBe(false);
		expect(useUIStore.getState().sidebarCollapsed).toBe(false);
	});

	it("collapses when the screen becomes small and restores the preference when large again", () => {
		act(() => useUIStore.getState().toggleSidebar(false));
		const { result } = renderHook(() => useSidebarCollapse());
		expect(result.current.collapsed).toBe(false);

		resize(true);
		expect(result.current.collapsed).toBe(true);

		resize(false);
		expect(result.current.collapsed).toBe(false);
	});
});

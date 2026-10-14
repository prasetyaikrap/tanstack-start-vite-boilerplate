import { EventEmitter } from "node:events";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A fake socket.io socket: an event emitter with the connection API the registry uses
class FakeSocket extends EventEmitter {
	connected = false;
	active = false;
	connect = vi.fn(() => {
		this.active = true;
		return this;
	});
	disconnect = vi.fn(() => {
		this.active = false;
		this.connected = false;
		return this;
	});
	serverConnects() {
		this.connected = true;
		this.emit("connect");
	}
	serverDisconnects() {
		this.connected = false;
		this.emit("disconnect");
	}
}

const createdSockets: FakeSocket[] = [];
const ioMock = vi.fn((_url: string, _options?: unknown) => {
	const socket = new FakeSocket();
	createdSockets.push(socket);
	return socket;
});

vi.mock("socket.io-client", () => ({ io: ioMock }));

const { useSocket } = await import("./useSocket");

beforeEach(() => {
	vi.useFakeTimers();
	createdSockets.length = 0;
	ioMock.mockClear();
});

afterEach(() => {
	// Unmount before flushing timers, so released connections are removed from the shared registry
	cleanup();
	vi.runOnlyPendingTimers();
	vi.useRealTimers();
});

describe("useSocket", () => {
	it("opens a connection and tracks its state", () => {
		const { result } = renderHook(() => useSocket("http://api.test"));
		const socket = createdSockets[0];

		expect(ioMock).toHaveBeenCalledWith(
			"http://api.test",
			expect.objectContaining({ autoConnect: false }),
		);
		expect(socket.connect).toHaveBeenCalledTimes(1);
		expect(result.current.socket).toBe(socket);
		expect(result.current.isConnected).toBe(false);

		act(() => socket.serverConnects());
		expect(result.current.isConnected).toBe(true);

		act(() => socket.serverDisconnects());
		expect(result.current.isConnected).toBe(false);
	});

	it("reports connection errors until the next connect", () => {
		const { result } = renderHook(() => useSocket("http://api.test"));
		const socket = createdSockets[0];

		act(() => {
			socket.emit("connect_error", new Error("unauthorized"));
		});
		expect(result.current.error?.message).toBe("unauthorized");

		act(() => socket.serverConnects());
		expect(result.current.error).toBeUndefined();
	});

	it("shares one connection and closes it after the last user unmounts", () => {
		const first = renderHook(() => useSocket("http://api.test"));
		const second = renderHook(() => useSocket("http://api.test"));

		expect(ioMock).toHaveBeenCalledTimes(1);
		expect(first.result.current.socket).toBe(second.result.current.socket);

		const socket = createdSockets[0];
		first.unmount();
		vi.runOnlyPendingTimers();
		expect(socket.disconnect).not.toHaveBeenCalled();

		second.unmount();
		vi.runOnlyPendingTimers();
		expect(socket.disconnect).toHaveBeenCalledTimes(1);
	});

	it("reuses the connection when remounted before it is released (StrictMode)", () => {
		const first = renderHook(() => useSocket("http://api.test"));
		first.unmount();
		renderHook(() => useSocket("http://api.test"));
		vi.runOnlyPendingTimers();

		expect(ioMock).toHaveBeenCalledTimes(1);
		expect(createdSockets[0].disconnect).not.toHaveBeenCalled();
	});

	it("uses separate connections for different URLs, paths or keys", () => {
		renderHook(() => useSocket("http://api.test"));
		renderHook(() => useSocket("http://other.test"));
		renderHook(() => useSocket("http://api.test", { path: "/ws" }));
		renderHook(() => useSocket("http://api.test", { key: "admin" }));

		expect(ioMock).toHaveBeenCalledTimes(4);
	});

	it("does not connect while disabled, and connects once enabled", () => {
		const { result, rerender } = renderHook(
			({ enabled }) => useSocket("http://api.test", { enabled }),
			{ initialProps: { enabled: false } },
		);

		expect(ioMock).not.toHaveBeenCalled();
		expect(result.current.socket).toBeNull();

		rerender({ enabled: true });
		expect(ioMock).toHaveBeenCalledTimes(1);
		expect(result.current.socket).toBe(createdSockets[0]);
	});

	it("does not reconnect when a new options object is passed on rerender", () => {
		const { rerender } = renderHook(
			({ auth }) => useSocket("http://api.test", { auth }),
			{ initialProps: { auth: { token: "a" } } },
		);
		rerender({ auth: { token: "a" } });

		expect(ioMock).toHaveBeenCalledTimes(1);
		expect(createdSockets[0].connect).toHaveBeenCalledTimes(1);
	});
});

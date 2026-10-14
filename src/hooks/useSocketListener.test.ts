import { EventEmitter } from "node:events";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSocketEvent, useSocketListener } from "./useSocketListener";

type Events = {
	order_created: { id: string };
	order_cancelled: { id: string; reason: string };
};

describe("useSocketEvent", () => {
	it("calls the handler for its event and unsubscribes on unmount", () => {
		const socket = new EventEmitter();
		const handler = vi.fn();

		const { unmount } = renderHook(() =>
			useSocketEvent({ socket, event: "ping", handler }),
		);

		socket.emit("ping", { at: 1 });
		expect(handler).toHaveBeenCalledWith({ at: 1 });

		unmount();
		expect(socket.listenerCount("ping")).toBe(0);
	});

	it("uses the latest handler without resubscribing", () => {
		const socket = new EventEmitter();
		const on = vi.spyOn(socket, "on");
		const first = vi.fn();
		const second = vi.fn();

		const { rerender } = renderHook(
			({ handler }) => useSocketEvent({ socket, event: "ping", handler }),
			{ initialProps: { handler: first } },
		);
		rerender({ handler: second });

		socket.emit("ping", 1);
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledWith(1);
		expect(on).toHaveBeenCalledTimes(1);
	});

	it("does not subscribe when disabled or without a socket", () => {
		const socket = new EventEmitter();

		renderHook(() =>
			useSocketEvent({
				socket,
				event: "ping",
				handler: vi.fn(),
				enabled: false,
			}),
		);
		renderHook(() =>
			useSocketEvent({ socket: null, event: "ping", handler: vi.fn() }),
		);

		expect(socket.listenerCount("ping")).toBe(0);
	});

	it("moves the subscription when the socket changes", () => {
		const first = new EventEmitter();
		const second = new EventEmitter();

		const { rerender } = renderHook(
			({ socket }) =>
				useSocketEvent({ socket, event: "ping", handler: vi.fn() }),
			{ initialProps: { socket: first } },
		);
		rerender({ socket: second });

		expect(first.listenerCount("ping")).toBe(0);
		expect(second.listenerCount("ping")).toBe(1);
	});
});

describe("useSocketListener", () => {
	it("dispatches each envelope to the handler for its event", () => {
		const socket = new EventEmitter();
		const onCreated = vi.fn();

		renderHook(() =>
			useSocketListener<Events>({
				socket,
				channel: "orders",
				handlers: { order_created: onCreated },
			}),
		);

		socket.emit("orders", { event: "order_created", data: { id: "1" } });
		socket.emit("orders", {
			event: "order_cancelled",
			data: { id: "2", reason: "x" },
		});
		socket.emit("orders", { event: "unknown_event", data: {} });
		socket.emit("orders", null);

		expect(onCreated).toHaveBeenCalledTimes(1);
		expect(onCreated).toHaveBeenCalledWith({ id: "1" });
	});

	it("reads event and data with custom accessors", () => {
		const socket = new EventEmitter();
		const onCancelled = vi.fn();

		renderHook(() =>
			useSocketListener<Events, { type: string; payload: unknown }>({
				socket,
				channel: "orders",
				getEvent: (message) => message.type,
				getData: (message) => message.payload,
				handlers: { order_cancelled: onCancelled },
			}),
		);

		socket.emit("orders", {
			type: "order_cancelled",
			payload: { id: "2", reason: "x" },
		});

		expect(onCancelled).toHaveBeenCalledWith({ id: "2", reason: "x" });
	});

	it("uses the latest handlers without resubscribing", () => {
		const socket = new EventEmitter();
		const on = vi.spyOn(socket, "on");
		const first = vi.fn();
		const second = vi.fn();

		const { rerender } = renderHook(
			({ onCreated }) =>
				useSocketListener<Events>({
					socket,
					channel: "orders",
					handlers: { order_created: onCreated },
				}),
			{ initialProps: { onCreated: first } },
		);
		rerender({ onCreated: second });

		socket.emit("orders", { event: "order_created", data: { id: "1" } });

		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledWith({ id: "1" });
		expect(on).toHaveBeenCalledTimes(1);
	});
});

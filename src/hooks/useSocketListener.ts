import { useEffect, useRef } from "react";

/**
 * Minimal socket shape: anything with on/off, such as the socket.io `Socket` returned by useSocket (typed or
 * untyped) or an event emitter. Parameters are `any` so sockets with typed event maps, whose `on` only accepts their own
 * event names, are still assignable.
 */
export type SocketLike = {
	// biome-ignore lint/suspicious/noExplicitAny: typed sockets restrict event names and listener types
	on(event: any, listener: any): unknown;
	// biome-ignore lint/suspicious/noExplicitAny: typed sockets restrict event names and listener types
	off(event: any, listener: any): unknown;
};

/** Default message shape for a channel that carries many event types: `{ event, data }` */
export type SocketEnvelope = {
	event: string;
	data?: unknown;
};

/** One optional handler per event name, receiving that event's data */
export type SocketEventHandlers<TEventMap extends Record<string, unknown>> = {
	[K in keyof TEventMap]?: (data: TEventMap[K]) => void;
};

type UseSocketEventProps<TPayload> = {
	socket: SocketLike | null | undefined;
	event: string;
	handler: (payload: TPayload) => void;
	enabled?: boolean;
};

/**
 * Subscribes to a single socket event. The handler does not need to be memoized: the latest one is read
 * from a ref, so re-renders never tear down and recreate the subscription.
 *
 * @example
 * const { socket } = useSocket(ENVS.APP_SOCKET_HOST);
 * useSocketEvent<OrderUpdated>({ socket, event: "order-updated", handler: (order) => refetch() });
 */
export function useSocketEvent<TPayload = unknown>({
	socket,
	event,
	handler,
	enabled = true,
}: UseSocketEventProps<TPayload>) {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!enabled || !socket) return;

		const listener = (payload: TPayload) => handlerRef.current(payload);
		socket.on(event, listener);

		return () => {
			socket.off(event, listener);
		};
	}, [socket, event, enabled]);
}

type UseSocketListenerProps<
	TEventMap extends Record<string, unknown>,
	TPayload,
> = {
	socket: SocketLike | null | undefined;
	/** Socket event that carries the envelopes, e.g. "notification" */
	channel: string;
	/** Only pass the events you care about; the rest are ignored */
	handlers: SocketEventHandlers<TEventMap>;
	enabled?: boolean;
	/** Reads the event name from a payload. Defaults to `payload.event` */
	getEvent?: (payload: TPayload) => string | undefined;
	/** Reads the event data from a payload. Defaults to `payload.data` */
	getData?: (payload: TPayload) => unknown;
};

/**
 * Subscribes to a channel whose messages carry many event types, and dispatches each message to the handler
 * for its event. Handlers and accessors do not need to be memoized, so inline functions are fine.
 *
 * @example
 * type NotificationEvents = {
 *   reminder_event: ReminderData;
 *   announcement_event: AnnouncementData;
 * };
 *
 * const { socket } = useSocket(ENVS.APP_SOCKET_HOST);
 *
 * useSocketListener<NotificationEvents>({
 *   socket,
 *   channel: "my-notification",
 *   handlers: {
 *     reminder_event: (data) => toDo(data.id),
 *   },
 * });
 */
export function useSocketListener<
	TEventMap extends Record<string, unknown>,
	TPayload = SocketEnvelope,
>({
	socket,
	channel,
	handlers,
	enabled = true,
	getEvent,
	getData,
}: UseSocketListenerProps<TEventMap, TPayload>) {
	// useSocketEvent keeps the latest handler in a ref, so this closure always sees the latest handlers and accessors
	useSocketEvent<TPayload>({
		socket,
		event: channel,
		enabled,
		handler: (payload) => {
			const event = getEvent
				? getEvent(payload)
				: (payload as SocketEnvelope | undefined)?.event;
			if (!event) return;

			const handler = handlers[event as keyof TEventMap];
			if (!handler) return;

			const data = getData
				? getData(payload)
				: (payload as SocketEnvelope | undefined)?.data;
			handler(data as TEventMap[keyof TEventMap]);
		},
	});
}

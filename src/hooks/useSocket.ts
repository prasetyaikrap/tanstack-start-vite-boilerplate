import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
	acquireSocket,
	getSocketKey,
	releaseSocket,
	type SocketConnectionOptions,
} from "@/providers/socket";

type EventsMap = Record<string, (...args: never[]) => void>;
type DefaultEventsMap = Socket extends Socket<infer ListenEvents>
	? ListenEvents
	: never;

export type UseSocketOptions = SocketConnectionOptions & {
	/** Connect only when true, e.g. after login. Defaults to true */
	enabled?: boolean;
	/** Components with the same key share one connection. Defaults to the URL and path */
	key?: string;
};

export type UseSocketReturn<
	ListenEvents extends EventsMap,
	EmitEvents extends EventsMap,
> = {
	/** null until the connection is opened in the browser (always null during SSR) */
	socket: Socket<ListenEvents, EmitEvents> | null;
	isConnected: boolean;
	/** Last connection error, cleared on the next successful connect */
	error?: Error;
};

/**
 * Opens a socket.io connection and shares it with every component using the same key. The connection is closed
 * when the last component unmounts. Connection options only apply when the connection is created.
 *
 * @example
 * const { socket, isConnected } = useSocket(ENVS.APP_SOCKET_HOST, {
 *   auth: (cb) => getAccessToken().then((token) => cb({ token })),
 * });
 *
 * useSocketListener<NotificationEvents>({
 *   socket,
 *   channel: "notification",
 *   handlers: { order_created: (data) => refetch() },
 * });
 */
export function useSocket<
	ListenEvents extends EventsMap = DefaultEventsMap,
	EmitEvents extends EventsMap = ListenEvents,
>(
	url: string,
	options: UseSocketOptions = {},
): UseSocketReturn<ListenEvents, EmitEvents> {
	const { enabled = true, key, ...connectionOptions } = options;
	const socketKey = key ?? getSocketKey(url, connectionOptions);

	// Read on connect only, so a new options object on every render does not reconnect
	const connectionOptionsRef = useRef(connectionOptions);
	connectionOptionsRef.current = connectionOptions;

	const [state, setState] = useState<UseSocketReturn<ListenEvents, EmitEvents>>(
		{
			socket: null,
			isConnected: false,
		},
	);

	useEffect(() => {
		if (!enabled) return;

		const socket = acquireSocket(
			socketKey,
			url,
			connectionOptionsRef.current,
		) as Socket<ListenEvents, EmitEvents>;

		const syncState = () =>
			setState({ socket, isConnected: socket.connected, error: undefined });
		const onConnectError = (error: Error) =>
			setState({ socket, isConnected: false, error });

		// Reserved events are always available, whatever ListenEvents is
		const reservedSocket = socket as unknown as Socket;
		reservedSocket.on("connect", syncState);
		reservedSocket.on("disconnect", syncState);
		reservedSocket.on("connect_error", onConnectError);
		syncState();

		return () => {
			reservedSocket.off("connect", syncState);
			reservedSocket.off("disconnect", syncState);
			reservedSocket.off("connect_error", onConnectError);
			releaseSocket(socketKey);
			setState({ socket: null, isConnected: false });
		};
	}, [socketKey, url, enabled]);

	return state;
}

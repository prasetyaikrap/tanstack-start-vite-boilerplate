import {
	io,
	type ManagerOptions,
	type Socket,
	type SocketOptions,
} from "socket.io-client";

export type SocketConnectionOptions = Partial<ManagerOptions & SocketOptions>;

type SocketEntry = {
	socket: Socket;
	consumers: number;
	releaseTimer?: ReturnType<typeof setTimeout>;
};

// Shared connections, one per key. Components using the same key share one socket
const sockets = new Map<string, SocketEntry>();

// Waiting a tick before disconnecting lets React StrictMode (mount → unmount → mount) and quick route changes
// reuse the connection instead of closing and reopening it
const RELEASE_DELAY_MS = 0;

/** Default key: the URL plus the socket.io path, so different servers or paths get separate connections */
export function getSocketKey(url: string, options?: SocketConnectionOptions) {
	return `${url}|${options?.path ?? "/socket.io"}`;
}

/**
 * Returns the shared socket for `key`, creating and connecting it on first use. Every call must be paired with
 * releaseSocket(key). Options only apply when the connection is created.
 */
export function acquireSocket(
	key: string,
	url: string,
	options?: SocketConnectionOptions,
): Socket {
	let entry = sockets.get(key);

	if (!entry) {
		const socket = io(url, { ...options, autoConnect: false });
		entry = { socket, consumers: 0 };
		sockets.set(key, entry);
	}

	if (entry.releaseTimer) {
		clearTimeout(entry.releaseTimer);
		entry.releaseTimer = undefined;
	}

	entry.consumers += 1;
	if (!entry.socket.connected && !entry.socket.active) {
		entry.socket.connect();
	}

	return entry.socket;
}

/** Releases one use of the socket. The connection is closed when nothing uses it anymore */
export function releaseSocket(key: string) {
	const entry = sockets.get(key);
	if (!entry) return;

	entry.consumers = Math.max(0, entry.consumers - 1);
	if (entry.consumers > 0) return;

	entry.releaseTimer = setTimeout(() => {
		const current = sockets.get(key);
		if (current !== entry || entry.consumers > 0) return;

		entry.socket.disconnect();
		sockets.delete(key);
	}, RELEASE_DELAY_MS);
}

/** Returns the shared socket for `key` if it is open, without connecting. Useful outside React (e.g. in handlers) */
export function getSocket(key: string): Socket | undefined {
	return sockets.get(key)?.socket;
}

import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useResourceContext } from "@/contexts/resource-provider/context";
import type {
	DataProvider,
	DataProviders,
	StreamMetaQuery,
} from "@/providers/data/type";
import type { MutationError } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Map of SSE event names to the shape of their parsed data payload.
 * Example: `{ token: { token: string }; complete: string }`
 */
export type SSEventHandlers<
	TEventMap extends Record<string, unknown> = Record<string, unknown>,
> = {
	[K in keyof TEventMap]?: (data: TEventMap[K]) => void;
};

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;

export type UseSSEventStreamProps<
	TVariables = unknown,
	TEventMap extends Record<string, unknown> = Record<string, unknown>,
	TError extends MutationError = MutationError,
	TOnMutateResult = unknown,
> = {
	dataProviderName?: keyof DataProviders;
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	meta?: StreamMetaQuery;
	/**
	 * Map of SSE event name → handler.
	 * The raw `data:` field is JSON-parsed before calling the handler;
	 * falls back to the raw string if parsing fails.
	 */
	events?: SSEventHandlers<TEventMap>;
} & Omit<
	UseMutationOptions<void, TError, TVariables, TOnMutateResult>,
	"mutationFn"
>;

export type UseSSEventStreamReturnType<
	TVariables = unknown,
	TError extends MutationError = MutationError,
	TOnMutateResult = unknown,
> = UseMutationResult<void, TError, TVariables, TOnMutateResult> & {
	/** Abort the in-flight stream (safe to call when idle). */
	abort: () => void;
};

// ---------------------------------------------------------------------------
// SSE stream parser
// ---------------------------------------------------------------------------

async function parseSSEStream(
	body: ReadableStream<Uint8Array>,
	getHandlers: () => SSEventHandlers,
	signal?: AbortSignal,
) {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	let aborted = false;

	const onAbort = () => {
		aborted = true;
		void reader.cancel().catch(() => undefined);
	};

	if (signal) {
		if (signal.aborted) onAbort();
		else signal.addEventListener("abort", onAbort, { once: true });
	}

	const dispatchEventPart = (part: string) => {
		if (!part.trim()) return;

		let eventName = "message";
		const dataLines: string[] = [];

		for (const rawLine of part.split(/\r?\n/)) {
			if (!rawLine || rawLine.startsWith(":")) continue;

			if (rawLine.startsWith("event:")) {
				eventName = rawLine.slice(6).trim();
				continue;
			}

			if (rawLine.startsWith("data:")) {
				let data = rawLine.slice(5);
				if (data.startsWith(" ")) data = data.slice(1);
				dataLines.push(data);
			}
		}

		const handler = getHandlers()[eventName];
		if (!handler) return;

		const raw = dataLines.join("\n");
		try {
			handler(JSON.parse(raw));
		} catch {
			handler(raw as any);
		}
	};

	try {
		while (true) {
			if (aborted) break;

			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });

			// SSE events are delimited by a blank line.
			const parts = buffer.split(/\r?\n\r?\n/);
			buffer = parts.pop() ?? ""; // last segment may be incomplete

			for (const part of parts) {
				dispatchEventPart(part);
			}
		}

		const finalChunk = decoder.decode();
		if (finalChunk) buffer += finalChunk;
		if (buffer.trim()) dispatchEventPart(buffer);
	} finally {
		if (signal) signal.removeEventListener("abort", onAbort);
		reader.releaseLock();
	}
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSSEventStream<
	TVariables = unknown,
	TEventMap extends Record<string, unknown> = Record<string, unknown>,
	TError extends MutationError = MutationError,
	TOnMutateResult = unknown,
>({
	dataProviderName = "default",
	resource,
	meta,
	events,
	...mutationOptions
}: UseSSEventStreamProps<
	TVariables,
	TEventMap,
	TError,
	TOnMutateResult
>): UseSSEventStreamReturnType<TVariables, TError, TOnMutateResult> {
	const { dataProvider } = useResourceContext();

	// Always reference the latest handlers without re-creating mutationFn.
	const eventsRef = useRef<SSEventHandlers<TEventMap> | undefined>(events);
	eventsRef.current = events;

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort();
			abortControllerRef.current = null;
		};
	}, []);

	const mutation = useMutation<void, TError, TVariables, TOnMutateResult>({
		...mutationOptions,
		mutationFn: async (variables) => {
			const provider = dataProvider[dataProviderName];
			if (!provider.stream) {
				return Promise.reject({
					success: false,
					message: `Data provider "${dataProviderName}" does not support streaming`,
				} as TError);
			}

			// Abort any previous in-flight request before starting a new one.
			abortControllerRef.current?.abort();
			const controller = new AbortController();
			abortControllerRef.current = controller;

			try {
				const { data: stream } = await provider.stream({
					resource: resource as any,
					variables: variables as Record<string, unknown>,
					meta: { ...meta, signal: controller.signal },
				});

				if (!stream) {
					return Promise.reject({
						success: false,
						message: "No stream returned from server",
					} as TError);
				}

				await parseSSEStream(
					stream,
					() => eventsRef.current ?? {},
					controller.signal,
				);
			} finally {
				if (abortControllerRef.current === controller) {
					abortControllerRef.current = null;
				}
			}
		},
	});

	return {
		...mutation,
		abort: () => abortControllerRef.current?.abort(),
	};
}

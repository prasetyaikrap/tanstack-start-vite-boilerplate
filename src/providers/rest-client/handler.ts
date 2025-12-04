import type {
	FetcherInstance,
	InterceptorRequest,
	InterceptorResponse,
	RestRoute,
	RestRouter,
} from "./type";

export function createFetcherInstance(): FetcherInstance {
	const requestInterceptors: InterceptorRequest<RequestInit>[] = [];
	const responseInterceptors: InterceptorResponse<Response, RequestInit>[] = [];
	async function runRequestInterceptors(
		init: RequestInit,
	): Promise<RequestInit> {
		let current = init;
		for (const fn of requestInterceptors) {
			current = await fn(current);
		}
		return current;
	}

	async function runResponseInterceptors(
		res: Response,
		originalRequest: RequestInit,
	): Promise<Response> {
		let current = res;
		for (const fn of responseInterceptors) {
			current = await fn(current, originalRequest);
		}
		return current;
	}

	async function wrappedFetch(input: RequestInfo, init: RequestInit = {}) {
		const finalInit = await runRequestInterceptors(init);

		const response = await fetch(input, finalInit);

		const finalResponse = await runResponseInterceptors(response, finalInit);

		return finalResponse;
	}

	return {
		fetch: wrappedFetch,
		addRequestInterceptor(fn) {
			requestInterceptors.push(fn);
		},
		addResponseInterceptor(fn) {
			responseInterceptors.push(fn);
		},
	};
}

export function contract<T extends Record<string, RestRoute>>(
	routes: RestRouter<T>,
) {
	return routes;
}

import { match, P } from "ts-pattern";
import type z from "zod";
import type { BaseKey } from "@/types";
import { HTTPError } from "@/utils/exceptions";
import type {
	InterceptorRequest,
	InterceptorResponse,
	RestClientProps,
	RestConfig,
	RestResponse,
	RestRouter,
} from "./type";

type ClientReducer<T extends RestRouter = RestRouter> = {
	[K in keyof T]: <
		R extends z.infer<T[K]["response"][number]> = z.infer<
			T[K]["response"][number]
		>,
	>(
		config?: RestConfig<
			z.infer<T[K]["params"]>,
			z.infer<T[K]["query"]>,
			z.infer<T[K]["payload"]>
		>,
	) => Promise<RestResponse<R>>;
};

export default class RestClient<T extends RestRouter = RestRouter> {
	private baseUrl: string;
	private routers: RestRouter<T>;
	private requestInterceptors: InterceptorRequest<RequestInit>[] = [];
	private responseInterceptors: InterceptorResponse<Response, RequestInit>[] =
		[];

	constructor({ baseUrl, routers }: RestClientProps<T>) {
		this.baseUrl = baseUrl;
		this.routers = routers;
	}

	addRequestInterceptor(fn: InterceptorRequest<RequestInit>) {
		this.requestInterceptors.push(fn);
	}

	addResponseInterceptor(fn: InterceptorResponse<Response, RequestInit>) {
		this.responseInterceptors.push(fn);
	}

	init() {
		const httpClient = this.fetcherInstance.bind(this);
		const schemaKeys = Object.keys(this.routers) as (keyof T)[];

		const clients = schemaKeys.reduce(
			(result: ClientReducer<T>, current) => {
				const { method, path } = this.routers[current];
				const apiClient = async <
					R extends z.infer<T[typeof current]["response"][number]> = z.infer<
						T[typeof current]["response"][number]
					>,
				>(
					config?: RestConfig<
						z.infer<T[typeof current]["params"]>,
						z.infer<T[typeof current]["query"]>,
						z.infer<T[typeof current]["payload"]>
					>,
				) => {
					const payload = config?.payload
						? JSON.stringify(config.payload)
						: undefined;
					const responseMode = config?.responseMode || "json";
					const routeParams = config?.params;
					const routeQuery = config?.query;
					const queries = new URLSearchParams();
					if (routeQuery) {
						for (const q in routeQuery) {
							queries.append(q, String(routeQuery[q] as unknown as string));
						}
					}
					const fullPath = this.generatePathUrl(
						this.baseUrl,
						path,
						routeParams as Record<string, BaseKey>,
						queries,
					);
					try {
						const result = await httpClient(fullPath, {
							method,
							body: payload,
							...config,
						});

						if (!result.ok) {
							const body = await result.json();
							return Promise.resolve({
								status: result.status,
								body: body as R,
								headers: result.headers,
							});
						}

						return match({ mode: responseMode })
							.with({ mode: "blob" }, async () => {
								const body = await result.blob();
								return Promise.resolve({
									status: result.status,
									body: body as R,
									headers: result.headers,
								});
							})
							.with({ mode: "text" }, async () => {
								const body = await result.text();
								return Promise.resolve({
									status: result.status,
									body: body as R,
									headers: result.headers,
								});
							})
							.otherwise(async () => {
								const body = await result.json();
								return Promise.resolve({
									status: result.status,
									body: body as R,
									headers: result.headers,
								});
							});
					} catch (e) {
						return match(e)
							.with(P.instanceOf(HTTPError), (error) => {
								return Promise.reject({
									status: error.statusCode,
									body: error.error as R,
									headers: new Headers(),
								});
							})
							.otherwise(() => {
								return Promise.reject({
									status: 500,
									body: {
										success: false,
										message: "Internal Server Error",
										error: e,
									},
									headers: new Headers(),
								});
							});
					}
				};

				return {
					...result,
					[current]: apiClient,
				};
			},
			{} as ClientReducer<T>,
		);

		return clients;
	}

	private async fetcherInstance(
		input: RequestInfo,
		init: RequestInit = {},
	): Promise<Response> {
		const finalInit = await this.runRequestInterceptors(init);

		const response = await fetch(input, finalInit);

		const finalResponse = await this.runResponseInterceptors(
			response,
			finalInit,
		);

		return finalResponse;
	}

	private async runRequestInterceptors(
		init: RequestInit,
	): Promise<RequestInit> {
		let current = init;
		for (const fn of this.requestInterceptors) {
			current = await fn(current);
		}
		return current;
	}

	private async runResponseInterceptors(
		res: Response,
		originalRequest: RequestInit,
	): Promise<Response> {
		let current = res;
		for (const fn of this.responseInterceptors) {
			current = await fn(current, originalRequest);
		}
		return current;
	}

	private generatePathUrl(
		baseUrl: string,
		path: string,
		params?: Record<string, BaseKey>,
		queries?: URLSearchParams,
	): string {
		let fullPath = `${baseUrl}${path}`;
		if (params) {
			fullPath = this.replaceRouteParams(fullPath, params);
		}
		if (queries && queries.toString() !== "") {
			fullPath = `${fullPath}?${queries}`;
		}
		return fullPath;
	}

	private replaceRouteParams(
		pattern: string,
		params: Record<string, BaseKey>,
	): string {
		return pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
			if (params[key]) {
				return String(params[key]);
			}
			throw new Error(`Missing value for parameter: ${key}`);
		});
	}
}

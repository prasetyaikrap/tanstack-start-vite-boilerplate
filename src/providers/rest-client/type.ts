import type z from "zod";

export type RestRouter<
	T extends Record<string, RestRoute> = Record<string, RestRoute>,
> = {
	[K in keyof T]: T[K];
};

export type RestRouteMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RestRoute = {
	path: string;
	method: RestRouteMethod;
	summary?: string;
	params?: z.ZodObject;
	payload?: z.ZodObject;
	query?: z.ZodObject;
	response: {
		[key: number]: z.ZodType | Blob | string | HTTPError;
	};
};

export type RestConfig<RCParams, RCQuery, RCPayload> = Omit<
	RequestInit,
	"method" | "body"
> & {
	params?: RCParams;
	query?: RCQuery;
	payload?: RCPayload;
	responseMode?: "json" | "text" | "blob";
};

export type RestResponse<T = unknown> = {
	status: number;
	body: T;
	headers: Headers;
};

export type InitRestClientProps<TRouter> = {
	baseUrl: string;
	routers: TRouter;
	httpClient?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

export type HTTPError = Error & {
	status: number;
};

export type InterceptorRequest<T> = (value: T) => Promise<T> | T;
export type InterceptorResponse<T, U> = (
	value: T,
	original: U,
) => Promise<T> | T;
export type FetcherInstance = {
	fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;

	addRequestInterceptor: (fn: InterceptorRequest<RequestInit>) => void;
	addResponseInterceptor: (
		fn: InterceptorResponse<Response, RequestInit>,
	) => void;
};

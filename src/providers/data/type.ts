import type { BaseKey } from "@/types/core";
import type {
	CrudFilter,
	CrudFilters,
	CrudSort,
	CrudSorting,
	Pagination,
} from "@/types/pagination";

export type MethodTypes = "GET" | "DELETE" | "HEAD" | "OPTIONS";
export type MethodTypesWithBody = "POST" | "PUT" | "PATCH";

export type AxiosMethodTypes =
	| "get"
	| "delete"
	| "head"
	| "options"
	| "post"
	| "put"
	| "patch";

export type ResponseBody<TData = unknown> = {
	success: boolean;
	message: string;
	data: TData;
	error?: Error;
};

export type ResponsesBody<TData = unknown> = {
	success: boolean;
	message: string;
	data: TData[];
	metadata: {
		total_rows: number;
		total_page: number;
		current_page: number;
		per_page: number;
		previousCursor: string;
		nextCursor: string;
	};
	error?: Error;
};

export type BaseAxiosClientResponse<T = unknown> = {
	status: number;
	body: T;
	headers: Headers;
};

export type MetaQuery = Record<string, any>;
export type GetListMetaQuery = MetaQuery & {
	filterMode?: "and" | "or";
	transformFilters?: (filters: CrudFilters) => CrudFilters;
	transformSorters?: (sorters: CrudSorting) => CrudSorting;
	paginationMode?: "server" | "client" | "infinite" | "none" | "cursor";
};
export type GetOneMetaQuery = MetaQuery;
export type CreateMetaQuery = MetaQuery;
export type UpdateMetaQuery = MetaQuery;
export type DeleteMetaQuery = MetaQuery;

export type DataProvider<TResource extends string = string> = {
	getList: (params: GetListParams<TResource>) => Promise<GetListResponse>;
	getOne: (params: GetOneParams<TResource>) => Promise<GetOneResponse>;
	create: (params: CreateParams<TResource>) => Promise<CreateResponse>;
	update: (params: UpdateParams<TResource>) => Promise<UpdateResponse>;
	delete: (params: DeleteParams<TResource>) => Promise<DeleteResponse>;
};

export type GetListParams<TResource extends string = string> = {
	resource: TResource;
	pagination?: Pagination;
	sorters?: CrudSort[];
	filters?: CrudFilter[];
	meta?: GetListMetaQuery;
};

export type GetOneParams<TResource extends string = string> = {
	resource: TResource;
	id?: BaseKey;
	meta?: GetOneMetaQuery;
};

type CreateParams<
	TResource extends string = string,
	TVariables = Record<string, unknown>,
> = {
	resource: TResource;
	variables: TVariables;
	meta?: CreateMetaQuery;
};
type UpdateParams<
	TResource extends string = string,
	TVariables = Record<string, unknown>,
> = {
	resource: TResource;
	variables: TVariables;
	meta?: UpdateMetaQuery;
};
type DeleteParams<
	TResource extends string = string,
	TVariables = Record<string, unknown>,
> = {
	resource: TResource;
	variables: TVariables;
	meta?: DeleteMetaQuery;
};

export type GetListResponse<TData = unknown> = ResponsesBody<TData>;
export type GetOneResponse<TData = unknown> = ResponseBody<TData>;
export type CreateResponse<TData = unknown> = ResponseBody<TData>;
export type UpdateResponse<TData = unknown> = ResponseBody<TData>;
export type DeleteResponse<TData = unknown> = ResponseBody<TData>;

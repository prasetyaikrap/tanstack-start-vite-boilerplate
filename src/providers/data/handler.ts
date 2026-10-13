import { match } from "ts-pattern";
import type { RestResponse } from "@/providers/rest-client/type";
import type { ApiError, BaseRecord } from "@/types";
import type {
	CrudFilters,
	CrudSorting,
	LogicalFilter,
	Pagination,
} from "@/types/pagination";
import { HTTPError } from "@/utils/exceptions";
import type {
	ErrorResponseBody,
	GetListMetaQuery,
	ResponseBody,
	ResponsesBody,
} from "./type";

const REQUEST_ID_HEADER = "X-Request-Id";

export function responseOk<T extends BaseRecord>(res: RestResponse) {
	const responseBody = res.body as unknown as ResponseBody<T>;
	if (res.status < 200 || res.status >= 300) {
		throw new HTTPError(
			responseBody?.message,
			res.status,
			responseBody,
			res.headers.get(REQUEST_ID_HEADER) ?? undefined,
		);
	}

	return responseBody;
}

export function responseBlobOk(res: RestResponse) {
	const responseBody = res.body as unknown as Blob;
	if (res.status < 200 || res.status >= 300) {
		throw new HTTPError(
			"Something went wrong",
			res.status,
			responseBody,
			res.headers.get(REQUEST_ID_HEADER) ?? undefined,
		);
	}

	return {
		code: res.status,
		message: "File downloaded successfully",
		data: responseBody,
	};
}

export function responsesOk<T extends BaseRecord>(res: RestResponse) {
	const responsesBody = res.body as unknown as ResponsesBody<T>;
	if (res.status < 200 || res.status >= 300) {
		throw new HTTPError(
			responsesBody?.message,
			res.status,
			responsesBody,
			res.headers.get(REQUEST_ID_HEADER) ?? undefined,
		);
	}

	return responsesBody;
}

// Normalizes any failure into ApiError: { code, message, data, error, requestId }.
// error is the backend error detail ({ id, type, code, data }) when the backend sent one
export function toApiError(err: RestResponse | HTTPError): ApiError {
	if (err instanceof HTTPError) {
		const body = err.error as Partial<ErrorResponseBody> | undefined;
		return {
			code: err.statusCode,
			message: err.message || "Something went wrong",
			data: null,
			error: body?.error ?? body,
			requestId: err.requestId,
		};
	}

	const body = err.body as Partial<ErrorResponseBody> | undefined;
	return {
		code: err.status,
		message: body?.message || "Something went wrong",
		data: null,
		error: body?.error ?? body,
		requestId: err.headers?.get(REQUEST_ID_HEADER) ?? undefined,
	};
}

export function responseError(err: RestResponse | HTTPError) {
	return Promise.reject(toApiError(err));
}

export function responsesError(err: RestResponse | HTTPError) {
	return Promise.reject(toApiError(err));
}

export function generateParams(
	filters: CrudFilters = [],
	sorters: CrudSorting = [],
	pagination: Pagination = { currentPage: 1, pageSize: 10, mode: "server" },
	opts?: {
		filterMode?: GetListMetaQuery["filterMode"];
		transformFilters?: GetListMetaQuery["transformFilters"];
		transformSorters?: GetListMetaQuery["transformSorters"];
		paginationMode?: GetListMetaQuery["paginationMode"];
		useQueryField?: boolean;
	},
) {
	const paramsPagination = match(opts?.paginationMode)
		.with("none", () => undefined)
		.with("cursor", () => {
			const { _cursor, _page, _direction } = filters.reduce(
				(result, current) => {
					if (
						["_cursor", "_page", "_direction"].includes(
							(current as LogicalFilter).field,
						)
					) {
						return {
							...result,
							[(current as LogicalFilter).field]: current.value,
						};
					}

					return result;
				},
				{
					_page: 1,
					_cursor: undefined,
					_direction: undefined,
				},
			);
			return { _limit: pagination.pageSize, _page, _cursor, _direction };
		})
		.with("infinite", () => ({
			_page: pagination.currentPage ?? 1,
			_limit: pagination.pageSize ?? 10,
		}))
		.otherwise(() => ({
			_page: pagination.currentPage ?? 1,
			_limit: pagination.pageSize ?? 10,
		}));

	const transformedFilters = opts?.transformFilters?.(filters) || filters;
	const paramsFilter = transformedFilters.reduce(
		(
			params: Record<string, string | number | boolean | undefined>,
			currentValue,
		) => {
			const { field, value } = currentValue as Omit<LogicalFilter, "value"> & {
				value: string | number | boolean | undefined;
			};
			const isSkipUpsert =
				value === undefined ||
				["_cursor", "_page", "_direction", "_limit"].includes(field);

			if (isSkipUpsert) return params;

			return { ...params, [field]: value };
		},
		{},
	);

	const paramQueries = match(opts?.useQueryField)
		.with(true, () => {
			const queries =
				Object.keys(paramsFilter).length > 0
					? JSON.stringify(paramsFilter)
					: undefined;
			return queries ? { queries } : {};
		})
		.otherwise(() => ({ ...paramsFilter }));

	const transformedSorters = opts?.transformSorters?.(sorters) || sorters;
	const sorterString = transformedSorters
		.map((sorter) => {
			if (sorter.order === "asc") {
				return sorter.field;
			}
			return `-${sorter.field}`;
		})
		.join(",");
	const paramsSorter = sorterString ? { _sort: sorterString } : {};

	return { ...paramsPagination, ...paramsSorter, ...paramQueries };
}

export const resourceNotFoundError = {
	status: 404,
	body: {
		code: 404,
		message: "Resource not found",
		data: null,
	},
	headers: new Headers(),
};

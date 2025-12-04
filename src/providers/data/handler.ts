import { match } from "ts-pattern";
import type { RestResponse } from "@/providers/rest-client/type";
import type { BaseRecord } from "@/types";
import type {
	CrudFilters,
	CrudSorting,
	LogicalFilter,
	Pagination,
} from "@/types/pagination";
import { HTTPError } from "@/utils/exceptions";
import type { MetaQuery, ResponseBody, ResponsesBody } from "./type";

export function responseOk<T extends BaseRecord>(res: RestResponse) {
	const responseBody = res.body as unknown as ResponseBody<T>;
	if (res.status < 200 || res.status >= 300) {
		throw new HTTPError(responseBody?.message, res.status, responseBody);
	}

	return responseBody;
}

export function responsesOk<T extends BaseRecord>(res: RestResponse) {
	const responsesBody = res.body as unknown as ResponsesBody<T>;
	if (res.status < 200 || res.status >= 300) {
		throw new HTTPError(responsesBody?.message, res.status, responsesBody);
	}

	return responsesBody;
}

export function responseError(err: RestResponse) {
	return Promise.reject(err.body);
}

export function generateParams(
	filters: CrudFilters = [],
	sorters: CrudSorting = [],
	pagination: Pagination = { currentPage: 1, pageSize: 10, mode: "server" },
	opts?: {
		filterMode?: MetaQuery["filterMode"];
		transformFilters?: MetaQuery["transformFilters"];
		transformSorters?: MetaQuery["transformSorters"];
		paginationMode?: MetaQuery["paginationMode"];
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
			_page: pagination.currentPage,
			_limit: pagination.pageSize,
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
				["_cursor", "_page", "_direction"].includes(field);

			if (isSkipUpsert) return params;

			return { ...params, [field]: value };
		},
		{},
	);

	const queries =
		Object.keys(paramsFilter).length > 0
			? JSON.stringify(paramsFilter)
			: undefined;
	const paramQueries = queries ? { queries } : {};

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

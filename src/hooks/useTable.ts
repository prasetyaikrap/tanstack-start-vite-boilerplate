import type { UseQueryResult } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type Table,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import { isEqual, isNull, isUndefined } from "lodash";
import { useEffect, useState } from "react";
import type {
	DataProvider,
	DataProviders,
	GetListMetaQuery,
	ResponsesBody,
} from "@/providers/data/type";
import type {
	BaseRecord,
	CrudFilter,
	CrudSort,
	ExtendedColumnFilter,
	ExtendedSorting,
	Pagination,
} from "@/types";
import { useIsFirstRender } from "./useFirstRender";
import { useList } from "./useList";

export type UseTableProps<TQueryFnData extends BaseRecord = BaseRecord> = {
	providers: ProviderProps;
} & Pick<TableOptions<TQueryFnData>, "columns"> &
	Partial<Omit<TableOptions<TQueryFnData>, "columns">>;

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type BaseQueryKey = {
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	pagination?: Pagination;
	filters?: CrudFilter[];
	sorters?: CrudSort[];
	meta?: GetListMetaQuery;
};
type QueryKey = ("table-data" | BaseQueryKey | unknown)[];
type QueryData<TQueryFnData> = {
	data: ResponsesBody<TQueryFnData>["data"];
	metadata: ResponsesBody<TQueryFnData>["metadata"];
};

type QueryError = {
	success: boolean;
	data?: unknown;
	message: string;
	error?: unknown;
};

type ProviderProps = {
	dataProviderName?: keyof DataProviders;
	resource?: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	pagination?: Pagination;
	filters?: {
		initial?: Omit<CrudFilter, "is_permanent">[];
		permanent?: Omit<CrudFilter, "is_permanent">[];
	};
	sorters?: {
		initial?: Omit<CrudSort, "is_permanent">[];
		permanent?: Omit<CrudSort, "is_permanent">[];
	};
	syncWithLocation?: boolean;
	meta?: GetListMetaQuery;
	queryOptions?: {
		enabled?: boolean;
		queryKey?: unknown[];
	};
};

export type UseTableReturnType<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
> = {
	reactTable: Table<TQueryFnData>;
	core: {
		tableQuery: UseQueryResult<QueryData<TQueryFnData>, TError>;
		result: {
			data: ResponsesBody<TQueryFnData>["data"];
			metadata?: ResponsesBody<TQueryFnData>["metadata"];
			total: number;
		};
		pageCount: number;
		currentPage: number;
		pageSize: number;
		setCurrentPage: (page: number) => void;
		setPageSize: (size: number) => void;
		sorters: CrudSort[];
		setSorters: (sorters: CrudSort[]) => void;
		filters: CrudFilter[];
		setFilters: (filters: CrudFilter[]) => void;
	};
};

const fallbackEmptyArray: unknown[] = [];

export function useTable<TQueryFnData extends BaseRecord = BaseRecord>({
	providers,
	...reactTableOptions
}: UseTableProps<TQueryFnData>): UseTableReturnType<TQueryFnData> {
	const searchParams = useSearch({ strict: false }) as Record<
		string,
		string | string[] | undefined
	>;
	const isFirstRender = useIsFirstRender();
	const [pagination, setPagination] = useState<Pagination>(() => {
		const pagination = {
			pageSize: providers?.pagination?.pageSize ?? 10,
			currentPage: providers?.pagination?.currentPage ?? 1,
		};
		if (providers?.syncWithLocation) {
			if (searchParams._page) {
				const page = Number(searchParams._page);
				if (!Number.isNaN(page)) {
					pagination.currentPage = page;
				}
			}
			if (searchParams._limit) {
				const limit = Number(searchParams._limit);
				if (!Number.isNaN(limit)) {
					pagination.pageSize = limit;
				}
			}
		}
		return pagination;
	});
	const [filters, setFilters] = useState<CrudFilter[]>(() => {
		const initialFilters = providers?.filters?.initial ?? [];
		const permanentFilters = providers?.filters?.permanent ?? [];
		const filters: CrudFilter[] = [...initialFilters];

		if (providers?.syncWithLocation) {
			Object.entries(searchParams).forEach(([key, value]) => {
				if (["_page", "_limit", "_sort"].includes(key)) return;
				if (isUndefined(value) || isNull(value)) return;
				let parsedValue: string | string[] | number | boolean = value;
				if (value === "true") {
					parsedValue = true;
				} else if (value === "false") {
					parsedValue = false;
				} else if (!Number.isNaN(Number(value))) {
					parsedValue = Number(value);
				}

				const currentFilterIndex = filters.findIndex(
					(filter) => filter.field === key,
				);
				if (currentFilterIndex > -1) {
					filters[currentFilterIndex].value =
						`${filters[currentFilterIndex].value},${parsedValue}`;
				} else {
					filters.push({
						field: key,
						value: parsedValue,
					});
				}
			});
		}

		permanentFilters.forEach((permanentFilter) => {
			const currentFilterIndex = filters.findIndex(
				(filter) => filter.field === permanentFilter.field,
			);
			if (currentFilterIndex > -1) {
				filters[currentFilterIndex].value = permanentFilter.value;
				filters[currentFilterIndex].is_permanent = true;
			} else {
				filters.push({ ...permanentFilter, is_permanent: true });
			}
		});

		return filters;
	});
	const [sorters, setSorters] = useState<CrudSort[]>(() => {
		const initialSorters = providers?.sorters?.initial ?? [];
		const permanentSorters = providers?.sorters?.permanent ?? [];
		const sorters: CrudSort[] = [...initialSorters];

		if (providers?.syncWithLocation) {
			if (searchParams._sort) {
				const sortParam = Array.isArray(searchParams._sort)
					? searchParams._sort
					: [searchParams._sort];
				sortParam.forEach((param) => {
					const paramName = param.replace(/^-/, ""); // remove starting "-"
					const isDesc = param.startsWith("-");
					const currentSorterIndex = sorters.findIndex(
						(sorter) => sorter.field === paramName,
					);
					if (currentSorterIndex > -1) {
						sorters[currentSorterIndex].order = isDesc ? "desc" : "asc";
						sorters[currentSorterIndex].is_permanent = true;
					} else {
						sorters.push({
							field: paramName,
							order: isDesc ? "desc" : "asc",
							is_permanent: true,
						});
					}
				});
			}
		}

		permanentSorters.forEach((permanentSorter) => {
			const currentSorterIndex = sorters.findIndex(
				(sorter) => sorter.field === permanentSorter.field,
			);
			if (currentSorterIndex > -1) {
				sorters[currentSorterIndex].order = permanentSorter.order;
			} else {
				sorters.push(permanentSorter);
			}
		});

		return sorters;
	});

	const isQueryEnabled = providers?.queryOptions?.enabled ?? true;
	const dataProviderName = providers?.dataProviderName || "default";
	const resource = providers?.resource;
	const isServerSide = Boolean(providers);

	const { queryResult } = useList<TQueryFnData, QueryError, QueryKey>({
		dataProviderName,
		resource: resource as any,
		pagination,
		filters,
		sorters,
		meta: providers?.meta,
		queryOptions: {
			enabled: isServerSide && isQueryEnabled && Boolean(resource),
			queryKey: [
				"table-data",
				{
					resource,
					pagination,
					filters,
					sorters,
					meta: providers?.meta,
				},
				...(providers?.queryOptions?.queryKey ?? []),
			],
		},
	});

	const reactTableProps = useReactTable<TQueryFnData>({
		data: queryResult.data?.data ?? (fallbackEmptyArray as TQueryFnData[]),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: isServerSide ? undefined : getSortedRowModel(),
		getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
		initialState: {
			pagination: {
				pageIndex: (pagination.currentPage || 1) - 1,
				pageSize: pagination.pageSize || 10,
			},
			columnFilters: filters.map((filter) => ({
				id: filter.field,
				value: filter.value,
				is_permanent: Boolean(filter.is_permanent),
			})),
			sorting: sorters.map((sorter) => ({
				id: sorter.field,
				desc: sorter.order === "desc",
				is_permanent: Boolean(sorter.is_permanent),
			})),
			...reactTableOptions.initialState,
		},
		pageCount: queryResult.data?.metadata.total_page || -1,
		manualPagination: true,
		manualFiltering: isServerSide,
		manualSorting: isServerSide,
		...reactTableOptions,
	});

	const { state, columns } = reactTableProps.options;
	const {
		pagination: reactTablePagination,
		sorting: reactTableSorting,
		columnFilters,
	} = state;

	const { pageIndex, pageSize } = reactTablePagination ?? {};

	useEffect(() => {
		if (pageIndex !== undefined) {
			setPagination((prev) => ({
				...prev,
				currentPage: pageIndex + 1,
			}));
		}
	}, [pageIndex]);

	useEffect(() => {
		if (pageSize !== undefined) {
			setPagination((prev) => ({
				...prev,
				pageSize: pageSize,
			}));
		}
	}, [pageSize]);

	useEffect(() => {
		if (!reactTableSorting) return;
		const newSorters: CrudSort[] = reactTableSorting.map(
			(sorting: ExtendedSorting) => ({
				field: sorting.id,
				order: sorting.desc ? "desc" : "asc",
				is_permanent: Boolean(sorting.is_permanent),
			}),
		);

		providers?.sorters?.permanent?.forEach((permanentSorter) => {
			const foundIndex = newSorters.findIndex(
				(s) => s.field === permanentSorter.field,
			);
			if (foundIndex > -1) {
				newSorters[foundIndex].is_permanent = true;
			} else {
				newSorters.push({ ...permanentSorter, is_permanent: true });
			}
		});

		if (!isEqual(sorters, newSorters)) {
			setSorters(newSorters);
		}

		if (newSorters.length > 0 && !isFirstRender) {
			setPagination((prev) => ({
				...prev,
				currentPage: 1,
			}));
		}
	}, [reactTableSorting]);

	useEffect(() => {
		if (!columnFilters) return;

		const newFilters: CrudFilter[] = columnFilters.map(
			(columnFilter: ExtendedColumnFilter) => ({
				field: columnFilter.id,
				value: columnFilter.value,
				is_permanent: Boolean(columnFilter.is_permanent),
			}),
		);

		providers?.filters?.permanent?.forEach((permanentFilter) => {
			const foundIndex = newFilters.findIndex(
				(f) => f.field === permanentFilter.field,
			);
			if (foundIndex > -1) {
				newFilters[foundIndex].is_permanent = true;
			} else {
				newFilters.push({ ...permanentFilter, is_permanent: true });
			}
		});

		if (!isEqual(filters, newFilters)) {
			setFilters(newFilters);
		}

		if (newFilters.length > 0 && !isFirstRender) {
			setPagination((prev) => ({
				...prev,
				currentPage: 1,
			}));
		}
	}, [columnFilters, columns]);

	useEffect(() => {
		if (!providers?.syncWithLocation) return;
		const params = new URLSearchParams();
		params.append("_page", String(pagination.currentPage));
		params.append("_limit", String(pagination.pageSize));
		sorters.forEach((sorter) => {
			params.append(
				"_sort",
				`${sorter.order === "desc" ? "-" : ""}${sorter.field}`,
			);
		});

		filters.forEach((filter) => {
			const paramValue = filter.value;
			if (typeof paramValue === "boolean" || typeof paramValue === "number") {
				params.append(`${filter.field}`, String(paramValue));
				return;
			}

			if (typeof paramValue === "string") {
				const paramValues = paramValue.split(",");
				paramValues.forEach((value) => {
					params.append(`${filter.field}`, value);
				});
				return;
			}

			if (Array.isArray(paramValue)) {
				paramValue.forEach((value) => {
					params.append(`${filter.field}`, String(value));
				});
				return;
			}
		});

		window.history.replaceState(null, "", `?${params.toString()}`);
	}, [providers?.syncWithLocation, pagination, filters, sorters]);

	const setCurrentPage = (page: number) => {
		setPagination((prev) => ({
			...prev,
			currentPage: page,
		}));
	};
	const setPageSize = (size: number) => {
		setPagination((prev) => ({
			...prev,
			pageSize: size,
		}));
	};

	return {
		reactTable: reactTableProps,
		core: {
			tableQuery: queryResult,
			result: {
				data: queryResult.data?.data ?? (fallbackEmptyArray as TQueryFnData[]),
				metadata: queryResult.data?.metadata,
				total: queryResult.data?.metadata?.total_rows ?? 0,
			},
			pageCount: queryResult.data?.metadata?.total_page ?? 0,
			currentPage: pagination.currentPage ?? 1,
			pageSize: pagination.pageSize ?? 10,
			setCurrentPage,
			setPageSize,
			sorters: sorters,
			setSorters,
			filters: filters,
			setFilters,
		},
	};
}

import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type Table,
	type TableOptions,
	useReactTable,
} from "@tanstack/react-table";
import { isEqual } from "lodash";
import { useEffect, useRef, useState } from "react";
import { dataProviders } from "@/providers/data";
import type { BaseRecord, CrudFilter, CrudSort, Pagination } from "@/types";
import type {
	DataProvider,
	GetListMetaQuery,
	ResponsesBody,
} from "../providers/data/type";

export type UseTableProps<TQueryFnData extends BaseRecord = BaseRecord> = {
	providers?: ProviderProps;
} & Pick<TableOptions<TQueryFnData>, "columns"> &
	Partial<Omit<TableOptions<TQueryFnData>, "columns">>;

type DataProviders = typeof dataProviders;
type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type BaseQueryKey = {
	resource?: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
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
		initial?: CrudFilter[];
		permanent?: CrudFilter[];
	};
	sorters?: {
		initial?: CrudSort[];
		permanent?: CrudSort[];
	};
	syncWithLocation?: boolean;
	meta?: GetListMetaQuery;
	queryOptions?: {
		enabled?: boolean;
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
	const isFirstRender = useIsFirstRender();
	const [pagination, setPagination] = useState<Pagination>({
		pageSize: providers?.pagination?.pageSize ?? 10,
		currentPage: providers?.pagination?.currentPage ?? 1,
	});
	const [filters, setFilters] = useState<CrudFilter[]>([
		...(providers?.filters?.initial ?? []),
		...(providers?.filters?.permanent ?? []),
	]);
	const [sorters, setSorters] = useState<CrudSort[]>([
		...(providers?.sorters?.initial ?? []),
		...(providers?.sorters?.permanent ?? []),
	]);

	const isQueryEnabled = providers?.queryOptions?.enabled ?? true;
	const dataProviderName = providers?.dataProviderName || "default";
	const resource = providers?.resource;
	const isServerSide = Boolean(providers);

	const queryResult = useQuery<
		QueryData<TQueryFnData>,
		QueryError,
		QueryData<TQueryFnData>,
		QueryKey
	>({
		queryKey: [
			"table-data",
			{
				resource,
				pagination,
				filters,
				sorters,
				meta: providers?.meta,
			},
		],
		queryFn: async ({ queryKey }) => {
			const { resource, pagination, filters, sorters, meta } =
				queryKey[1] as BaseQueryKey;
			try {
				const { data, metadata } = await dataProviders[
					dataProviderName
				].getList({
					resource: resource as Exclude<typeof resource, undefined>,
					pagination: pagination,
					filters: filters,
					sorters: sorters,
					meta: meta,
				});
				return { data: data as TQueryFnData[], metadata };
			} catch (error) {
				return Promise.reject(error);
			}
		},
		enabled: isServerSide && isQueryEnabled && Boolean(resource),
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
			})),
			sorting: sorters.map((sorter) => ({
				id: sorter.field,
				desc: sorter.order === "desc",
			})),
			...reactTableOptions.initialState,
		},
		pageCount: queryResult.data?.metadata.total_page,
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
		const newSorters: CrudSort[] = reactTableSorting.map((sorting) => ({
			field: sorting.id,
			order: sorting.desc ? "desc" : "asc",
		}));

		providers?.sorters?.permanent?.forEach((permanentSorter) => {
			if (!newSorters.find((s) => s.field === permanentSorter.field)) {
				newSorters.push(permanentSorter);
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

		const newFilters: CrudFilter[] = columnFilters.map((columnFilter) => ({
			field: columnFilter.id,
			value: columnFilter.value,
		}));

		providers?.filters?.permanent?.forEach((permanentFilter) => {
			if (!newFilters.find((f) => f.field === permanentFilter.field)) {
				newFilters.push(permanentFilter);
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

export const useIsFirstRender = () => {
	const firstRender = useRef(true);

	useEffect(() => {
		firstRender.current = false;
	}, []);

	return firstRender.current;
};

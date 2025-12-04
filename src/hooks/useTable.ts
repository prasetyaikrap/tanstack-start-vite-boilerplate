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
	MetaQuery,
	ResponsesBody,
} from "../providers/data/type";

export type UseTableProps<TData extends BaseRecord = BaseRecord> = {
	providers?: ProviderProps;
} & Pick<TableOptions<TData>, "columns"> &
	Partial<Omit<TableOptions<TData>, "columns">>;

type DataProviders = typeof dataProviders;
type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type QueryKey = [
	"table-data",
	{
		resource?: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
		pagination?: Pagination;
		filters?: CrudFilter[];
		sorters?: CrudSort[];
		meta?: MetaQuery;
	},
];
type QueryData<TData> = {
	data: ResponsesBody<TData>["data"];
	metadata: ResponsesBody<TData>["metadata"];
};

type QueryError = {
	success: boolean;
	message: string;
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
	meta?: MetaQuery;
	queryOptions?: {
		enabled?: boolean;
	};
};

export type UseTableReturnType<TData extends BaseRecord = BaseRecord> = {
	reactTable: Table<TData>;
	core: {
		tableQuery: UseQueryResult<QueryData<TData>, QueryError>;
		result: {
			data: TData[];
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

export function useTable<TData extends BaseRecord = BaseRecord>({
	providers,
	...reactTableOptions
}: UseTableProps<TData>): UseTableReturnType<TData> {
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
		QueryData<TData>,
		QueryError,
		QueryData<TData>,
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
				queryKey[1] as Exclude<(typeof queryKey)[number], string>;
			const { success, data, message, metadata } = await dataProviders[
				dataProviderName
			].getList({
				resource: resource as Exclude<typeof resource, undefined>,
				pagination: pagination,
				filters: filters,
				sorters: sorters,
				meta: meta,
			});
			if (!success) {
				return Promise.reject({ success, message });
			}
			return { data: data as TData[], metadata };
		},
		enabled: isServerSide && isQueryEnabled && Boolean(resource),
	});

	const reactTableProps = useReactTable<TData>({
		data: queryResult.data?.data ?? (fallbackEmptyArray as TData[]),
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
				data: queryResult.data?.data ?? (fallbackEmptyArray as TData[]),
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

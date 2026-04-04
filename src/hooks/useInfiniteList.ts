import {
	type InfiniteData,
	type UseInfiniteQueryOptions,
	type UseInfiniteQueryResult,
	useInfiniteQuery,
} from "@tanstack/react-query";
import { useResourceContext } from "@/components/layouts/resource-provider";
import type {
	DataProvider,
	DataProviders,
	GetListMetaQuery,
	ResponsesBody,
} from "@/providers/data/type";
import type { BaseRecord, CrudFilter, CrudSort, Pagination } from "@/types";

export type UseInfiniteListProps<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
	TQueryKey extends QueryKey = QueryKey,
> = {
	dataProviderName?: keyof DataProviders;
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	pagination?: Pagination;
	filters?: CrudFilter[];
	sorters?: CrudSort[];
	meta?: GetListMetaQuery;
	queryOptions?: Omit<
		UseInfiniteQueryOptions<
			QueryData<TQueryFnData>,
			TError,
			InfiniteData<QueryData<TQueryFnData>>,
			TQueryKey,
			PageParam
		>,
		"queryFn" | "getNextPageParam" | "getPreviousPageParam" | "initialPageParam"
	>;
};

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type BaseQueryKey = {
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	pagination?: Pagination;
	filters?: CrudFilter[];
	sorters?: CrudSort[];
	meta?: GetListMetaQuery;
};
type QueryKey = ("useInfiniteList" | BaseQueryKey | unknown)[];
type QueryData<TQueryFnData> = {
	data: TQueryFnData[];
	metadata: ResponsesBody<TQueryFnData>["metadata"];
};

type QueryError = {
	success: boolean;
	data?: unknown;
	message: string;
	error?: unknown;
};

type PageParam = {
	page: number;
};

export type UseInfiniteListReturnType<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
> = {
	queryResult: UseInfiniteQueryResult<
		InfiniteData<QueryData<TQueryFnData>>,
		TError
	>;
};

export function useInfiniteList<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
	TQueryKey extends QueryKey = QueryKey,
>({
	dataProviderName = "default",
	resource,
	pagination,
	filters,
	sorters,
	meta,
	queryOptions,
}: UseInfiniteListProps<
	TQueryFnData,
	TError,
	TQueryKey
>): UseInfiniteListReturnType<TQueryFnData, TError> {
	const { dataProvider } = useResourceContext();

	const queryResult = useInfiniteQuery<
		QueryData<TQueryFnData>,
		TError,
		InfiniteData<QueryData<TQueryFnData>>,
		TQueryKey,
		PageParam
	>({
		refetchOnWindowFocus: false,
		...queryOptions,
		queryKey: [
			"useInfiniteList",
			{
				resource,
				pagination,
				filters,
				sorters,
				meta,
			},
			...(queryOptions?.queryKey ?? []),
		] as TQueryKey,
		queryFn: async ({ queryKey, pageParam }) => {
			const { resource, pagination, filters, sorters, meta } =
				queryKey[1] as BaseQueryKey;

			try {
				const { data: listData, metadata } = await dataProvider[
					dataProviderName as keyof DataProviders
				].getList({
					resource: resource as any,
					pagination: {
						...pagination,
						currentPage: pageParam.page || pagination?.currentPage || 1,
					},
					filters: filters,
					sorters: sorters,
					meta: meta,
				});
				return { data: listData as TQueryFnData[], metadata };
			} catch (error) {
				return Promise.reject(error);
			}
		},
		getNextPageParam: (lastPage) => {
			const { metadata } = lastPage;
			const nextPage = metadata.current_page + 1;
			if (nextPage > metadata.total_page) {
				return null;
			}
			return { page: nextPage };
		},
		getPreviousPageParam: (firstPage) => {
			const { metadata } = firstPage;
			const previousPage = metadata.current_page - 1;
			if (previousPage < 1) {
				return null;
			}
			return { page: previousPage };
		},
		initialPageParam: { page: pagination?.currentPage || 1 },
		enabled: (queryOptions?.enabled ?? true) && Boolean(resource),
	});

	return {
		queryResult,
	};
}

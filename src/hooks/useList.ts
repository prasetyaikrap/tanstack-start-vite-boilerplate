import {
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { dataProviders } from "@/providers/data";
import type {
	DataProvider,
	GetListMetaQuery,
	ResponsesBody,
} from "@/providers/data/type";
import type { BaseRecord, CrudFilter, CrudSort, Pagination } from "@/types";

export type UseListProps<
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
		UseQueryOptions<
			QueryData<TQueryFnData>,
			TError,
			QueryData<TQueryFnData>,
			TQueryKey
		>,
		"queryFn"
	>;
};

type DataProviders = typeof dataProviders;
type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type BaseQueryKey = {
	resource?: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	pagination?: Pagination;
	filters?: CrudFilter[];
	sorters?: CrudSort[];
	meta?: GetListMetaQuery;
};
type QueryKey = ("useList" | BaseQueryKey | unknown)[];
type QueryData<TQueryFnData> = {
	data: ResponsesBody<TQueryFnData>["data"];
	metadata: ResponsesBody<TQueryFnData>["metadata"];
};

type QueryError = {
	success: boolean;
	message: string;
};

export type UseListReturnType<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
> = {
	tableQuery: UseQueryResult<QueryData<TQueryFnData>, TError>;
};

export function useList<
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
}: UseListProps<TQueryFnData, TError, TQueryKey>): UseListReturnType<
	TQueryFnData,
	TError
> {
	const queryResult = useQuery<
		QueryData<TQueryFnData>,
		TError,
		QueryData<TQueryFnData>,
		TQueryKey
	>({
		...queryOptions,
		queryKey: [
			"useList",
			{
				resource,
				pagination,
				filters,
				sorters,
				meta,
			},
		] as TQueryKey,
		queryFn: async ({ queryKey }) => {
			const { resource, pagination, filters, sorters, meta } =
				queryKey[1] as BaseQueryKey;
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
			return { data: data as TQueryFnData[], metadata };
		},
		enabled: (queryOptions?.enabled ?? true) && Boolean(resource),
	});

	return {
		tableQuery: queryResult,
	};
}

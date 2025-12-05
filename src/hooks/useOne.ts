import {
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { dataProviders } from "@/providers/data";
import type {
	DataProvider,
	GetOneMetaQuery,
	ResponseBody,
} from "@/providers/data/type";
import type { BaseKey, BaseRecord } from "@/types";

export type UseListProps<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
	TQueryKey extends QueryKey = QueryKey,
> = {
	dataProviderName?: keyof DataProviders;
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	id?: BaseKey;
	meta?: GetOneMetaQuery;
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
	id?: BaseKey;
};
type QueryKey = ("useOne" | BaseQueryKey | unknown)[];
type QueryData<TQueryFnData> = {
	data: ResponseBody<TQueryFnData>["data"];
};

type QueryError = {
	success: boolean;
	message: string;
	data?: unknown;
	error?: unknown;
};

export type UseListReturnType<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
> = {
	tableQuery: UseQueryResult<QueryData<TQueryFnData>, TError>;
};

export function useOne<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
	TQueryKey extends QueryKey = QueryKey,
>({
	dataProviderName = "default",
	resource,
	id = "",
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
			"useOne",
			{
				resource,
				id,
				meta,
			},
		] as TQueryKey,
		queryFn: async ({ queryKey }) => {
			const { resource, id } = queryKey[1] as BaseQueryKey;
			try {
				const { data } = await dataProviders[dataProviderName].getOne({
					resource: resource as Exclude<typeof resource, undefined>,
					id: id as Exclude<typeof id, undefined>,
					meta: meta,
				});
				return { data: data as TQueryFnData };
			} catch (error) {
				return Promise.reject(error);
			}
		},
		enabled: (queryOptions?.enabled ?? true) && Boolean(resource),
	});

	return {
		tableQuery: queryResult,
	};
}

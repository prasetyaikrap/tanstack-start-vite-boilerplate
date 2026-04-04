import {
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { useResourceContext } from "@/components/layouts/resource-provider";
import type {
	DataProvider,
	DataProviders,
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

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type BaseQueryKey = {
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	id?: BaseKey;
	meta?: GetOneMetaQuery;
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

export type UseOneReturnType<
	TQueryFnData extends BaseRecord = BaseRecord,
	TError extends QueryError = QueryError,
> = {
	queryResult: UseQueryResult<QueryData<TQueryFnData>, TError>;
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
}: UseListProps<TQueryFnData, TError, TQueryKey>): UseOneReturnType<
	TQueryFnData,
	TError
> {
	const { dataProvider } = useResourceContext();

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
			...(queryOptions?.queryKey ?? []),
		] as TQueryKey,
		queryFn: async ({ queryKey }) => {
			const { resource, id } = queryKey[1] as BaseQueryKey;
			try {
				const { data: oneData } = await dataProvider[
					dataProviderName as keyof DataProviders
				].getOne({
					resource: resource as any,
					id: id as Exclude<typeof id, undefined>,
					meta,
				});
				return { data: oneData as TQueryFnData };
			} catch (error) {
				return Promise.reject(error);
			}
		},
		enabled: (queryOptions?.enabled ?? true) && Boolean(resource),
	});

	return {
		queryResult,
	};
}

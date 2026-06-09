import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useResourceContext } from "@/contexts/resource-provider/context";
import type {
  DataProvider,
  DataProviders,
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
    "queryFn" | "queryKey"
  > & {
    queryKey?: TQueryKey;
  };
};

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type BaseQueryKey = {
  resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
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
  data?: unknown;
  message: string;
  error?: unknown;
};

export type UseListReturnType<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError extends QueryError = QueryError,
> = {
  queryResult: UseQueryResult<QueryData<TQueryFnData>, TError>;
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
  const { dataProvider } = useResourceContext();

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
      ...(queryOptions?.queryKey ?? []),
    ] as TQueryKey,
    queryFn: async ({ queryKey, signal }) => {
      const { resource, pagination, filters, sorters, meta } =
        queryKey[1] as BaseQueryKey;

      try {
        const { data: listData, metadata } = await dataProvider[
          dataProviderName as keyof DataProviders
        ].getList({
          resource: resource as any,
          pagination: pagination,
          filters: filters,
          sorters: sorters,
          meta: { ...meta, signal },
        });
        return { data: listData as TQueryFnData[], metadata };
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

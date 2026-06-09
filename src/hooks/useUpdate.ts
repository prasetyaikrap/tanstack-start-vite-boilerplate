import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { useResourceContext } from "@/contexts/resource-provider/context";
import type {
  DataProvider,
  DataProviders,
  UpdateMetaQuery,
} from "@/providers/data/type";
import { MutationError } from "@/types";

export type UseUpdateProps<
  TData = unknown,
  TError extends MutationError = MutationError,
  TVariables = unknown,
  TOnMutateResult = unknown,
> = {
  dataProviderName?: keyof DataProviders;
  id?: string | number;
  resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
  meta?: UpdateMetaQuery;
} & Omit<
  UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  "mutationFn"
>;

export type UseUpdateReturnType<
  TData = unknown,
  TError extends MutationError = MutationError,
  TVariables = unknown,
  TOnMutateResult = unknown,
> = UseMutationResult<TData, TError, TVariables, TOnMutateResult>;

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;

export function useUpdate<
  TData = unknown,
  TError extends MutationError = MutationError,
  TVariables = unknown,
  TOnMutateResult = unknown,
>({
  dataProviderName = "default",
  id,
  resource,
  meta,
  ...mutationOptions
}: UseUpdateProps<
  TData,
  TError,
  TVariables,
  TOnMutateResult
>): UseUpdateReturnType<TData, TError, TVariables, TOnMutateResult> {
  const { dataProvider } = useResourceContext();

  const mutation = useMutation({
    ...mutationOptions,
    mutationFn: async (variables) => {
      try {
        const { data: updateOneData } = await dataProvider[
          dataProviderName
        ].update({
          resource: resource as any,
          id,
          variables: variables as Record<string, unknown>,
          meta,
        });
        return { data: updateOneData } as TData;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  });

  return mutation;
}

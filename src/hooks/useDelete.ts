import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { useResourceContext } from "@/contexts/resource-provider/context";
import type {
	DataProvider,
	DataProviders,
	DeleteMetaQuery,
} from "@/providers/data/type";
import type { MutationError } from "@/types";

export type UseDeleteProps<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
> = {
	dataProviderName?: keyof DataProviders;
	id?: string | number;
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	meta?: DeleteMetaQuery;
} & Omit<
	UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
	"mutationFn"
>;

export type UseDeleteReturnType<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
> = UseMutationResult<TData, TError, TVariables, TOnMutateResult>;

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;

export function useDelete<
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
}: UseDeleteProps<
	TData,
	TError,
	TVariables,
	TOnMutateResult
>): UseDeleteReturnType<TData, TError, TVariables, TOnMutateResult> {
	const { dataProvider } = useResourceContext();

	const mutation = useMutation({
		...mutationOptions,
		mutationFn: async (variables) => {
			try {
				const { data: deleteOneData } = await dataProvider[
					dataProviderName
				].delete({
					resource: resource as any,
					id,
					variables: variables as Record<string, unknown>,
					meta,
				});
				return { data: deleteOneData } as TData;
			} catch (error) {
				return Promise.reject(error);
			}
		},
	});

	return mutation;
}

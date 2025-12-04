import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { dataProviders } from "@/providers/data";
import type { DataProvider, UpdateMetaQuery } from "@/providers/data/type";

export type UseUpdateProps<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
> = {
	dataProviderName?: keyof DataProviders;
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

type DataProviders = typeof dataProviders;
type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type MutationError = {
	success: boolean;
	message: string;
};

export function useUpdate<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
>({
	dataProviderName = "default",
	resource,
	meta,
	...mutationOptions
}: UseUpdateProps<
	TData,
	TError,
	TVariables,
	TOnMutateResult
>): UseUpdateReturnType<TData, TError, TVariables, TOnMutateResult> {
	const mutation = useMutation({
		...mutationOptions,
		mutationFn: async (variables) => {
			const { success, data, message } = await dataProviders[
				dataProviderName
			].update({
				resource,
				variables: variables as Record<string, unknown>,
				meta,
			});
			if (!success) {
				return Promise.reject({ success, message });
			}
			return { data } as TData;
		},
	});

	return mutation;
}

import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { dataProviders } from "@/providers/data";
import type { CreateMetaQuery, DataProvider } from "@/providers/data/type";

export type UseCreateProps<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
> = {
	dataProviderName?: keyof DataProviders;
	resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
	meta?: CreateMetaQuery;
} & Omit<
	UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
	"mutationFn"
>;

export type UseCreateReturnType<
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

export function useCreate<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
>({
	dataProviderName = "default",
	resource,
	meta,
	...mutationOptions
}: UseCreateProps<
	TData,
	TError,
	TVariables,
	TOnMutateResult
>): UseCreateReturnType<TData, TError, TVariables, TOnMutateResult> {
	const mutation = useMutation({
		...mutationOptions,
		mutationFn: async (variables) => {
			const { success, data, message } = await dataProviders[
				dataProviderName
			].create({
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

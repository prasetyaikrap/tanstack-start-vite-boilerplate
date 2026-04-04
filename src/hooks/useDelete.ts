import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { useResourceContext } from "@/components/layouts/resource-provider";
import type {
	DataProvider,
	DataProviders,
	DeleteMetaQuery,
} from "@/providers/data/type";

export type UseDeleteProps<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
> = {
	dataProviderName?: keyof DataProviders;
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
type MutationError = {
	success: boolean;
	message: string;
	data?: unknown;
	error?: unknown;
};

export function useDelete<
	TData = unknown,
	TError extends MutationError = MutationError,
	TVariables = unknown,
	TOnMutateResult = unknown,
>({
	dataProviderName = "default",
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

import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { useResourceContext } from "@/components/layouts/resource-provider";
import type {
	CreateMetaQuery,
	DataProvider,
	DataProviders,
} from "@/providers/data/type";

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

type ExtractResourceKeys<T> = T extends DataProvider<infer R> ? R : never;
type MutationError = {
	success: boolean;
	message: string;
	data?: unknown;
	error?: unknown;
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
	const { dataProvider } = useResourceContext();

	const mutation = useMutation({
		...mutationOptions,
		mutationFn: async (variables) => {
			try {
				const { data: createOneData } = await dataProvider[
					dataProviderName
				].create({
					resource: resource as any,
					variables: variables as Record<string, unknown>,
					meta,
				});
				return { data: createOneData } as TData;
			} catch (error) {
				return Promise.reject(error);
			}
		},
	});

	return mutation;
}

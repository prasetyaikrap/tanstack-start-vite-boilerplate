import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import z from "zod";
import { dataProviders } from "@/providers/data";
import type { DataProvider, DeleteMetaQuery } from "@/providers/data/type";

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

type DataProviders = typeof dataProviders;
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
	const deleteOneHook = useServerFn(deleteOneServerFn);
	const mutation = useMutation({
		...mutationOptions,
		mutationFn: async (variables) => {
			try {
				const { data } = await deleteOneHook({
					data: {
						dataProviderName,
						resource,
						variables: variables as Record<string, unknown>,
						meta,
					},
				});
				return { data } as TData;
			} catch (error) {
				return Promise.reject(error);
			}
		},
	});

	return mutation;
}

const deleteOneServerFn = createServerFn()
	.inputValidator(
		z.custom<{
			dataProviderName: keyof DataProviders;
			resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
			variables: Record<string, unknown>;
			meta?: DeleteMetaQuery;
		}>(),
	)
	.handler(async (data) => {
		const { dataProviderName, resource, variables, meta } = data.data;
		const { data: deleteOneData } = await dataProviders[
			dataProviderName
		].delete({
			resource,
			variables,
			meta,
		});

		return { data: deleteOneData as any };
	});

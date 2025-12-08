import {
	type UseMutationOptions,
	type UseMutationResult,
	useMutation,
} from "@tanstack/react-query";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import z from "zod";
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
	data?: unknown;
	error?: unknown;
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
	const updateOneHook = useServerFn(updateOneServerFn);
	const mutation = useMutation({
		...mutationOptions,
		mutationFn: async (variables) => {
			try {
				const { data } = await updateOneHook({
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

const updateOneServerFn = createServerFn()
	.inputValidator(
		z.custom<{
			dataProviderName: keyof DataProviders;
			resource: ExtractResourceKeys<DataProviders[keyof DataProviders]>;
			variables: Record<string, unknown>;
			meta?: UpdateMetaQuery;
		}>(),
	)
	.handler(async (data) => {
		const { dataProviderName, resource, variables, meta } = data.data;
		const { data: updateOneData } = await dataProviders[
			dataProviderName
		].update({
			resource,
			variables,
			meta,
		});

		return { data: updateOneData as any };
	});

import { match } from "ts-pattern";
import { ENVS } from "@/configs/envs";
import RestClient from "../rest-client";
import { mockRouter } from "./api/mock-schema";
import {
	generateParams,
	resourceNotFoundError,
	responseError,
	responsesOk,
} from "./handler";
import {
	authRequestInterceptor,
	authResponseInterceptor,
} from "./interceptors";
import type { BaseResourceKeys, DataProvider } from "./type";

type ResourceKeys = BaseResourceKeys | keyof typeof mockRouter;

export function mockProvider(): DataProvider<ResourceKeys> {
	const client = new RestClient({
		baseUrl: ENVS.APP_MOCK_SERVICE_HOST,
		routers: mockRouter,
	});
	client.addRequestInterceptor(authRequestInterceptor);
	client.addResponseInterceptor(authResponseInterceptor);
	const service = client.init();

	return {
		getList: async ({ resource, filters, sorters, pagination, meta }) => {
			const query = generateParams(filters, sorters, pagination, {
				transformFilters: meta?.transformFilters,
				transformSorters: meta?.transformSorters,
				paginationMode: meta?.paginationMode,
				filterMode: meta?.filterMode,
			});
			return match({ resource })
				.with({ resource: "posts" }, () =>
					service
						.posts({ query })
						.then((res) =>
							responsesOk({
								status: 200,
								body: {
									success: true,
									message: "Success",
									data: res.body,
									metadata: {
										total_rows: 100,
										total_page: 10,
										current_page: pagination?.currentPage || 1,
										per_page: pagination?.pageSize || 10,
										previousCursor: "",
										nextCursor: "",
									},
								},
								headers: new Headers(),
							}),
						)
						.catch(responseError),
				)
				.otherwise(() => Promise.reject(responseError(resourceNotFoundError)));
		},
		getOne: async ({ resource }) => {
			return match({ resource }).otherwise(() =>
				Promise.reject(responseError(resourceNotFoundError)),
			);
		},
		create: async ({ resource }) => {
			return match({ resource }).otherwise(() =>
				Promise.reject(responseError(resourceNotFoundError)),
			);
		},
		update: async ({ resource }) => {
			return match({ resource }).otherwise(() =>
				Promise.reject(responseError(resourceNotFoundError)),
			);
		},
		delete: async ({ resource }) => {
			return match({ resource }).otherwise(() =>
				Promise.reject(responseError(resourceNotFoundError)),
			);
		},
	};
}

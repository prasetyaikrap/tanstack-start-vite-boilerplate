import { match } from "ts-pattern";
import { ENVS } from "@/configs/envs";
import RestClient from "../rest-client";
import { authRouter } from "./api/auth-schema";
import type {
	AuthExchangePayload,
	AuthExchangeResponse,
	AuthLoginPayload,
	AuthLoginResponse,
	AuthLogoutResponse,
	AuthRegisterPayload,
	AuthRegisterResponse,
	AuthRenewResponse,
	AuthVerifyResponse,
} from "./api/type";
import { responseError, responseOk, responsesError } from "./handler";
import {
	authRequestInterceptor,
	authResponseInterceptor,
} from "./interceptors";
import type { DataProvider } from "./type";

type ResourceKeys =
	| "auth-login"
	| "auth-logout"
	| "auth-register"
	| "auth-verify"
	| "auth-exchange"
	| "auth-renew"
	| "test-posts";

export function authProvider(): DataProvider<ResourceKeys> {
	const client = new RestClient({
		baseUrl: ENVS.APP_AUTH_SERVICE_HOST,
		routers: authRouter,
	});
	client.addRequestInterceptor(authRequestInterceptor);
	client.addResponseInterceptor(authResponseInterceptor);
	const service = client.init();

	return {
		getList: async ({ resource }) => {
			// const query = generateParams(filters, sorters, pagination, {
			//   transformFilters: meta?.transformFilters,
			//   transformSorters: meta?.transformSorters,
			//   paginationMode: meta?.paginationMode,
			//   filterMode: meta?.filterMode,
			// });
			return match({ resource }).otherwise(() =>
				Promise.reject(
					responsesError({
						status: 500,
						body: {
							success: false,
							message: "Resource not found",
							data: null,
							error: "Resource not found",
							metadata: {
								total_rows: 0,
								total_page: 1,
								current_page: 1,
								per_page: 0,
								previousCursor: "",
								nextCursor: "",
							},
						},
						headers: new Headers(),
					}),
				),
			);
		},
		getOne: async ({ resource }) => {
			return match({ resource })
				.with({ resource: "auth-verify" }, () =>
					service
						.authVerify<AuthVerifyResponse>()
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() =>
					Promise.reject(
						responsesError({
							status: 500,
							body: {
								success: false,
								message: "Resource not found",
								data: null,
								error: "Resource not found",
							},
							headers: new Headers(),
						}),
					),
				);
		},
		create: async ({ resource, variables }) => {
			return match({ resource })
				.with({ resource: "auth-register" }, () =>
					service
						.authRegister<AuthRegisterResponse>({
							payload: variables as AuthRegisterPayload,
						})
						.then(responseOk)
						.catch(responseError),
				)
				.with({ resource: "auth-login" }, () =>
					service
						.authLogin<AuthLoginResponse>({
							payload: variables as AuthLoginPayload,
						})
						.then(responseOk)
						.catch(responseError),
				)
				.with({ resource: "auth-exchange" }, () =>
					service
						.authExchange<AuthExchangeResponse>({
							payload: variables as AuthExchangePayload,
						})
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() =>
					Promise.reject(
						responsesError({
							status: 500,
							body: {
								success: false,
								message: "Resource not found",
								data: null,
								error: "Resource not found",
							},
							headers: new Headers(),
						}),
					),
				);
		},
		update: async ({ resource }) => {
			return match({ resource })
				.with({ resource: "auth-renew" }, () =>
					service
						.authRenew<AuthRenewResponse>()
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() =>
					Promise.reject(
						responsesError({
							status: 500,
							body: {
								success: false,
								message: "Resource not found",
								data: null,
								error: "Resource not found",
							},
							headers: new Headers(),
						}),
					),
				);
		},
		delete: async ({ resource }) => {
			return match({ resource })
				.with({ resource: "auth-logout" }, () =>
					service
						.authLogout<AuthLogoutResponse>()
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() =>
					Promise.reject(
						responsesError({
							status: 500,
							body: {
								success: false,
								message: "Resource not found",
								data: null,
								error: "Resource not found",
							},
							headers: new Headers(),
						}),
					),
				);
		},
	};
}

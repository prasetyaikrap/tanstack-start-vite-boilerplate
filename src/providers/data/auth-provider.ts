import { match } from "ts-pattern";
import { ENVS } from "@/configs/envs";
import { defaultFetcher } from "@/providers/fetcher";
import initRestClient from "../rest-client";
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
import { responseError, responseOk } from "./handler";
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
	const service = initRestClient({
		baseUrl: ENVS.APP_AUTH_SERVICE_HOST,
		routers: authRouter,
		httpClient: defaultFetcher,
	});

	return {
		getList: async ({ resource }) => {
			// const query = generateParams(filters, sorters, pagination, {
			//   transformFilters: meta?.transformFilters,
			//   transformSorters: meta?.transformSorters,
			//   paginationMode: meta?.paginationMode,
			//   filterMode: meta?.filterMode,
			// });
			return match({ resource }).otherwise(() =>
				Promise.reject("Method not implemented"),
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
					Promise.reject({
						success: false,
						message: "Resource not found",
					}),
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
					Promise.reject({
						success: false,
						message: "Resource not found",
					}),
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
					Promise.reject({
						success: false,
						message: "Resource not found",
					}),
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
					Promise.reject({
						success: false,
						message: "Resource not found",
					}),
				);
		},
	};
}

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
import { resourceNotFoundError, responseError, responseOk } from "./handler";
import {
	authRequestInterceptor,
	authResponseInterceptor,
} from "./interceptors";
import type { BaseResourceKeys, DataProvider } from "./type";

type ResourceKeys = BaseResourceKeys | keyof typeof authRouter;

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
				Promise.reject(responseError(resourceNotFoundError)),
			);
		},
		getOne: async ({ resource }) => {
			return match({ resource })
				.with({ resource: "authVerify" }, () =>
					service
						.authVerify<AuthVerifyResponse>()
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() => Promise.reject(responseError(resourceNotFoundError)));
		},
		create: async ({ resource, variables }) => {
			return match({ resource })
				.with({ resource: "authRegister" }, () =>
					service
						.authRegister<AuthRegisterResponse>({
							payload: variables as AuthRegisterPayload,
						})
						.then(responseOk)
						.catch(responseError),
				)
				.with({ resource: "authLogin" }, () =>
					service
						.authLogin<AuthLoginResponse>({
							payload: variables as AuthLoginPayload,
						})
						.then(responseOk)
						.catch(responseError),
				)
				.with({ resource: "authExchange" }, () =>
					service
						.authExchange<AuthExchangeResponse>({
							payload: variables as AuthExchangePayload,
						})
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() => Promise.reject(responseError(resourceNotFoundError)));
		},
		update: async ({ resource }) => {
			return match({ resource })
				.with({ resource: "authRenew" }, () =>
					service
						.authRenew<AuthRenewResponse>()
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() => Promise.reject(responseError(resourceNotFoundError)));
		},
		delete: async ({ resource }) => {
			return match({ resource })
				.with({ resource: "authLogout" }, () =>
					service
						.authLogout<AuthLogoutResponse>()
						.then(responseOk)
						.catch(responseError),
				)
				.otherwise(() => Promise.reject(responseError(resourceNotFoundError)));
		},
	};
}

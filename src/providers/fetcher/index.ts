import { redirect } from "node_modules/@tanstack/router-core/dist/esm/redirect";
import { COOKIES } from "@/configs/cookies";
import { ENVS } from "@/configs/envs";
import { authRouter } from "@/providers/data/api/auth-schema";
import type { AuthRenewResponse } from "@/providers/data/api/type";
import { createFetcherInstance } from "@/providers/rest-client/handler";
import { HTTPError } from "@/utils/exceptions";
import { deleteCookies, getCookies, setCookies } from "@/utils/general";
import initRestClient from "../rest-client";

function fetcherInstance() {
	const fetcherInstance = createFetcherInstance();

	fetcherInstance.addRequestInterceptor(authRequestInterceptor);
	fetcherInstance.addResponseInterceptor(authenticationResponseInterceptor);

	return fetcherInstance.fetch;
}

async function authRequestInterceptor(config: RequestInit) {
	const [accessToken] = await getCookies([COOKIES.accessToken]);
	const adjustedConfig: RequestInit = {
		...config,
		headers: {
			"X-Client-Id": ENVS.APP_ID,
			"X-Client-Version": ENVS.APP_VERSION,
			Authorization: `Bearer ${accessToken?.value ?? ""}`,
			...config.headers,
		},
	};

	return adjustedConfig;
}

async function authenticationResponseInterceptor(
	res: Response,
	originalRequest: RequestInit,
) {
	const isRenewToken =
		new Headers(originalRequest.headers).get("X-Renew-Token") === "true";
	if (res.status === 401 && !isRenewToken) {
		const authService = initRestClient({
			baseUrl: ENVS.APP_AUTH_SERVICE_HOST,
			routers: authRouter,
		});
		const [refreshToken] = await getCookies([COOKIES.refreshToken]);
		if (!refreshToken?.value) {
			return res;
		}

		try {
			const {
				status,
				body: { success, message, data },
			} = await authService.authRenew<AuthRenewResponse>({
				headers: {
					"X-Client-Id": ENVS.APP_ID,
					"X-Client-Version": ENVS.APP_VERSION,
					"X-Renew-Token": "true",
					Authorization: `Bearer ${refreshToken?.value ?? ""}`,
				},
				cache: "no-store",
			});

			if (!success) {
				throw new HTTPError(`Failed to renew token: ${message}`, status, data);
			}

			const newAccessToken = data.access_token;
			const newRefreshToken = data.refresh_token;
			await setCookies([
				{ name: COOKIES.accessToken, value: newAccessToken },
				{ name: COOKIES.refreshToken, value: newRefreshToken },
			]);
			const newRequest: RequestInit = {
				...originalRequest,
				headers: {
					...originalRequest.headers,
					Authorization: `Bearer ${newAccessToken}`,
				},
			};
			return await defaultFetcher(res.url, newRequest);
		} catch {
			await deleteCookies([COOKIES.accessToken, COOKIES.refreshToken]);

			redirect({ to: "/" });
		}
	}

	return res;
}

export const defaultFetcher = fetcherInstance();

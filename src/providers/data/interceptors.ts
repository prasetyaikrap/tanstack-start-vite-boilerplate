import { redirect } from "@tanstack/react-router";
import { COOKIES } from "@/configs/cookies";
import { ENVS } from "@/configs/envs";
import { HTTPError } from "@/utils/exceptions";
import { deleteCookies, getCookies, setCookies } from "@/utils/server-actions";
import RestClient from "../rest-client";
import { authRouter } from "./api/auth-schema";
import type { AuthRenewResponse } from "./api/type";

export async function authRequestInterceptor(config: RequestInit) {
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

export async function authResponseInterceptor(
	res: Response,
	originalRequest: RequestInit,
) {
	const isRenewToken =
		new Headers(originalRequest.headers).get("X-Renew-Token") === "true";
	if (res.status === 401 && !isRenewToken) {
		const authService = new RestClient({
			baseUrl: ENVS.APP_AUTH_SERVICE_HOST,
			routers: authRouter,
		}).init();

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
			return await fetch(res.url, newRequest);
		} catch {
			await deleteCookies([
				{ name: COOKIES.accessToken },
				{ name: COOKIES.refreshToken },
			]);

			redirect({ to: "/" });
		}
	}

	return res;
}

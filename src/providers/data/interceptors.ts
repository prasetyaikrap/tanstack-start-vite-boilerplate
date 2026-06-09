import { COOKIES } from "@/configs/cookies";
import { ENVS } from "@/configs/envs";
import { HTTPError } from "@/utils/exceptions";
import { getCookies, setCookies } from "@/utils/server-actions";
import RestClient from "../rest-client";
import { authRouter } from "./api/auth-schema";
import type { AuthRenewResponse } from "./api/type";

export async function authRequestInterceptor(config: RequestInit) {
	const [accessToken] = await getCookies({ data: [COOKIES.accessToken] });
	const adjustedConfig: RequestInit = {
		...config,
		headers: {
			"X-Client-Id": ENVS.APP_ID,
			"X-Client-Version": ENVS.APP_VERSION,
			"Content-Type": "application/json",
			...(accessToken?.value && {
				Authorization: `Bearer ${accessToken?.value}`,
			}),
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
    new Headers(originalRequest.headers).get("X-Renew-Token") === "1";

	if (res.status === 401 && !isRenewToken) {
		const authService = new RestClient({
			baseUrl: ENVS.APP_AUTH_SERVICE_HOST,
			routers: authRouter,
		}).init();

		const [refreshToken] = await getCookies({ data: [COOKIES.refreshToken] });
		if (!refreshToken?.value) {
			return res;
		}

		try {
		const { status: renewStatus, body: renewBody } =
			await authService.authRenew<AuthRenewResponse>({
				headers: {
					"X-Client-Id": ENVS.APP_ID,
					"X-Client-Version": ENVS.APP_VERSION,
					"X-Renew-Token": "1",
					"Content-Type": "application/json",
					...(refreshToken?.value && {
					Authorization: `Bearer ${refreshToken?.value}`,
					}),
				},
				cache: "no-store",
			});

		if (renewStatus !== 200) {
			throw new HTTPError(
			`Failed to renew token: ${renewBody.message}`,
			renewStatus,
			renewBody.data,
			);
		}

		const { access_token, refresh_token } = renewBody.data;
		await setCookies({
			data: [
			{ name: COOKIES.accessToken, value: access_token },
			{ name: COOKIES.refreshToken, value: refresh_token },
			],
		});

		const newRequest: RequestInit = {
			...originalRequest,
			headers: {
			...originalRequest.headers,
			Authorization: `Bearer ${access_token}`,
			},
		};
			return await fetch(res.url, newRequest);
		} catch (e) {
			console.error(e);
		}
	}

	return res;
}

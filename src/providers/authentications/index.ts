import { COOKIES } from "@/configs/cookies";
import { ENVS } from "@/configs/envs";
import { authRouter } from "@/providers/data/api/auth-schema";
import type {
	AuthExchangeResponse,
	AuthLogoutResponse,
	AuthVerifyResponse,
} from "@/providers/data/api/type";
import { defaultFetcher } from "@/providers/fetcher";
import initRestClient from "@/providers/rest-client";
import { deleteCookies, getCookies, setCookies } from "@/utils/general";
import type { AuthActionResponse, AuthProvider, CheckResponse } from "./type";

type BaseParams = {
	resource?: string;
};

type LoginParams = {
	code: string;
	grant_type: string;
	redirectTo?: string;
} & BaseParams;

type CheckParams = {} & BaseParams;

const authService = initRestClient({
	baseUrl: ENVS.APP_AUTH_SERVICE_HOST,
	routers: authRouter,
	httpClient: defaultFetcher,
});

export const authProvider: AuthProvider = {
	login: async ({
		grant_type,
		code,
		redirectTo = "/dashboard",
	}: LoginParams): Promise<AuthActionResponse> => {
		const { status, body } =
			await authService.authExchange<AuthExchangeResponse>({
				payload: { grant_type, code },
			});

		if (status !== 200) {
			return {
				success: false,
				redirectTo: "/login",
				error: {
					type: "provider_auth_login",
					message: body.message || "Something Went Wrong",
				},
			};
		}

		const { access_token, refresh_token } = body.data;
		await setCookies([
			{ name: COOKIES.accessToken, value: access_token },
			{ name: COOKIES.refreshToken, value: refresh_token },
		]);

		return {
			success: true,
			redirectTo,
		};
	},
	check: async (params: CheckParams): Promise<CheckResponse> => {
		const protectedResources = ["protected"];
		if (!protectedResources.includes(params?.resource || "")) {
			return Promise.resolve({
				authenticated: true,
			});
		}

		const { status, body } = await authService.authVerify<AuthVerifyResponse>();

		if (status !== 200) {
			return {
				authenticated: false,
				redirectTo: "/login",
				logout: true,
				error: {
					type: "provider_auth_check",
					message: body.message || "Authentication Failed",
				},
			};
		}

		const { access_token, refresh_token } = body.data;
		await setCookies([
			{ name: COOKIES.accessToken, value: access_token },
			{ name: COOKIES.refreshToken, value: refresh_token },
		]);

		return {
			authenticated: true,
		};
	},
	logout: async (): Promise<AuthActionResponse> => {
		const [refreshTokenCookie] = await getCookies([COOKIES.refreshToken]);
		const { status, body } = await authService.authLogout<AuthLogoutResponse>({
			headers: {
				Authorization: `Bearer ${refreshTokenCookie?.value ?? ""}`,
			},
		});

		if (status !== 200) {
			return {
				success: false,
				error: {
					type: "provider_auth_logout",
					message: body.message || "Logout Failed",
				},
			};
		}

		await deleteCookies([COOKIES.accessToken, COOKIES.refreshToken]);

		return {
			success: true,
			redirectTo: "/login",
		};
	},
	//   getIdentity: async (params: any): Promise<IdentityResponse> => {},
	// optional methods
	//   register: async (params: any): Promise<AuthActionResponse> => {},
	//   forgotPassword: async (params: any): Promise<AuthActionResponse> => {},
	//   updatePassword: async (params: any): Promise<AuthActionResponse> => {},
	//   getPermissions: async (params: any): Promise<unknown> => {},
};

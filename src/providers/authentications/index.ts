import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { COOKIES } from "@/configs/cookies";
import { ENVS } from "@/configs/envs";
import { authRouter } from "@/providers/data/api/auth-schema";
import type {
	AuthExchangeResponse,
	AuthLogoutResponse,
	AuthVerifyResponse,
} from "@/providers/data/api/type";
import RestClient from "@/providers/rest-client";
import { deleteCookies, getCookies, setCookies } from "@/utils/server-actions";
import { authRequestInterceptor } from "../data/interceptors";
import type {
	AuthActionResponse,
	AuthProviderReturnType,
	CheckResponse,
} from "./type";

type BaseParams = {
	resource?: string;
};

type LoginParams = {
	code: string;
	grantType: string;
	redirectTo?: string;
} & BaseParams;

type CheckParams = {} & BaseParams;

export class AuthProvider implements AuthProviderReturnType {
	public authService: ReturnType<RestClient<typeof authRouter>["init"]>;
	public loginServerFn: ReturnType<typeof this._loginServerfn>;
	public checkServerFn: ReturnType<typeof this._checkServerfn>;
	public logoutServerFn: ReturnType<typeof this._logoutServerfn>;
	constructor() {
		const client = new RestClient({
			baseUrl: ENVS.APP_AUTH_SERVICE_HOST,
			routers: authRouter,
		});

		client.addRequestInterceptor(authRequestInterceptor);
		this.authService = client.init();
		this.loginServerFn = this._loginServerfn();
		this.checkServerFn = this._checkServerfn();
		this.logoutServerFn = this._logoutServerfn();
	}

	async login({
		grantType,
		code,
		redirectTo,
	}: LoginParams): Promise<AuthActionResponse> {
		try {
			const { status, body } =
				await this.authService.authExchange<AuthExchangeResponse>({
					payload: { grant_type: grantType, code },
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
			await setCookies({
				data: [
					{ name: COOKIES.accessToken, value: access_token },
					{ name: COOKIES.refreshToken, value: refresh_token },
				],
			});

			return {
				success: true,
				redirectTo,
			};
		} catch (error) {
			return {
				success: false,
				redirectTo: "/login",
				error: {
					type: "provider_auth_login",
					message: (error as Error)?.message || "Something Went Wrong",
				},
			};
		}
	}

	private _loginServerfn() {
		return createServerFn()
			.inputValidator(
				z.object({
					code: z.string(),
					grantType: z.string(),
					redirectTo: z.string().optional(),
				}),
			)
			.handler(async ({ data }) => {
				const result = await this.login(data);
				return {
					...result,
					error: result.error
						? {
								type: result.error.type,
								message: result.error.message,
								error: result.error.error ?? undefined,
							}
						: undefined,
				};
			});
	}

	async check(params: CheckParams): Promise<CheckResponse> {
		const protectedResources = ["protected"];
		if (!protectedResources.includes(params?.resource || "")) {
			return Promise.resolve({
				authenticated: true,
			});
		}

		try {
			const { status, body } =
				await this.authService.authVerify<AuthVerifyResponse>();
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
			await setCookies({
				data: [
					{ name: COOKIES.accessToken, value: access_token },
					{ name: COOKIES.refreshToken, value: refresh_token },
				],
			});

			return {
				authenticated: true,
			};
		} catch (error) {
			return {
				authenticated: false,
				redirectTo: "/login",
				logout: true,
				error: {
					type: "provider_auth_check",
					message: (error as Error)?.message || "Authentication Failed",
				},
			};
		}
	}

	private _checkServerfn() {
		return createServerFn()
			.inputValidator(
				z.object({
					resource: z.string().optional(),
				}),
			)
			.handler(async ({ data }) => {
				const result = await this.check(data);
				return {
					...result,
					error: result.error
						? {
								type: result.error.type,
								message: result.error.message,
								error: result.error.error ?? undefined,
							}
						: undefined,
				};
			});
	}

	async logout(): Promise<AuthActionResponse> {
		try {
			const [refreshTokenCookie] = await getCookies({
				data: [COOKIES.refreshToken],
			});
			const { status, body } =
				await this.authService.authLogout<AuthLogoutResponse>({
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

			await deleteCookies({
				data: [{ name: COOKIES.accessToken }, { name: COOKIES.refreshToken }],
			});

			return {
				success: true,
				redirectTo: "/login",
			};
		} catch (error) {
			return {
				success: false,
				error: {
					type: "provider_auth_logout",
					message: (error as Error)?.message || "Logout Failed",
				},
			};
		}
	}

	private _logoutServerfn() {
		return createServerFn().handler(async () => {
			const result = await this.logout();
			return {
				...result,
				error: result.error
					? {
							type: result.error.type,
							message: result.error.message,
							error: result.error.error ?? undefined,
						}
					: undefined,
			};
		});
	}
}

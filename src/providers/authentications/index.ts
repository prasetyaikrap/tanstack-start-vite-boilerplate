import type {
	AuthActionResponse,
	AuthProviderProps,
	AuthProviderReturnType,
	CheckResponse,
} from "./type";

type BaseParams = {
	resource?: string;
};

type LoginParams = {
	email: string;
	password: string;
	redirectTo?: string;
} & BaseParams;

type CheckParams = {} & BaseParams;

export class AuthProvider implements AuthProviderReturnType {
	private payload: AuthProviderProps;
	constructor(payload: AuthProviderProps) {
		this.payload = payload;

		this.login = this.login.bind(this);
		this.check = this.check.bind(this);
		this.logout = this.logout.bind(this);
	}

	async login({ redirectTo }: LoginParams): Promise<AuthActionResponse> {
		try {
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

	async check(_params: CheckParams): Promise<CheckResponse> {
		try {
			return {
				authenticated: true,
				redirectTo: "/",
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

	async logout(): Promise<AuthActionResponse> {
		try {
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
}

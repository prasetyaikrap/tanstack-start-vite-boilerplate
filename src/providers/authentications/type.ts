import type { AppError } from "@/types";

export type CheckResponse = {
	authenticated: boolean;
	redirectTo?: string;
	logout?: boolean;
	error?: AuthError;
};

export type OnErrorResponse = {
	redirectTo?: string;
	logout?: boolean;
	error?: AuthError;
};

export type SuccessNotificationResponse = {
	message: string;
	description?: string;
};

export type AuthActionResponse = {
	success: boolean;
	redirectTo?: string;
	error?: AuthError;
	[key: string]: unknown;
	successNotification?: SuccessNotificationResponse;
};

export type AuthError = AppError;

export type AuthProvider = {
	login: (params: any) => Promise<AuthActionResponse>;
	logout: (params: any) => Promise<AuthActionResponse>;
	check: (params?: any) => Promise<CheckResponse>;
	register?: (params: any) => Promise<AuthActionResponse>;
	forgotPassword?: (params: any) => Promise<AuthActionResponse>;
	updatePassword?: (params: any) => Promise<AuthActionResponse>;
	getIdentity?: <TIdentityResponse = unknown>(
		params?: any,
	) => Promise<TIdentityResponse>;
};

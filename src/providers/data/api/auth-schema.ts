import z from "zod";
import { contract } from "@/providers/rest-client/handler";
import { schema as BaseSchema } from "./base";

const { BaseErrorResponse, BaseResponse, BaseIdResponse } = BaseSchema;

const AuthRegisterPayload = z
	.object({
		email: z.email(),
		password: z.string().min(8),
		first_name: z.string().min(1),
		last_name: z.string().min(1),
		avatar: z.string().optional(),
	})
	.loose();

const AuthLoginPayload = z
	.object({
		email: z.email(),
		password: z.string().min(8),
	})
	.loose();
const AuthExchangePayload = z
	.object({
		code: z.string(),
		grant_type: z.string(),
	})
	.loose();

// Responses
const AuthRegisterResponse = BaseIdResponse;

const AuthLoginResponse = BaseResponse.and(
	z
		.object({
			data: z
				.object({
					code: z.string(),
					grant_type: z.string(),
				})
				.loose(),
		})
		.loose(),
);

const AuthExchangeResponse = BaseResponse.and(
	z
		.object({
			data: z
				.object({
					access_token: z.string(),
					refresh_token: z.string(),
				})
				.loose(),
		})
		.loose(),
);

const AuthVerifyResponse = BaseResponse.and(
	z
		.object({
			data: z
				.object({
					access_token: z.string(),
					refresh_token: z.string(),
				})
				.loose(),
		})
		.loose(),
);

const AuthRenewResponse = BaseResponse.and(
	z
		.object({
			data: z
				.object({
					access_token: z.string(),
					refresh_token: z.string(),
				})
				.loose(),
		})
		.loose(),
);

const AuthLogoutResponse = BaseResponse;

export const schema = {
	AuthRegisterPayload,
	AuthLoginPayload,
	AuthExchangePayload,

	AuthRegisterResponse,
	AuthLoginResponse,
	AuthExchangeResponse,
	AuthVerifyResponse,
	AuthRenewResponse,
	AuthLogoutResponse,
};

export const authRouter = contract({
	authRegister: {
		method: "POST",
		path: "/v1/authentications/register",
		summary: "User Registration",
		payload: AuthRegisterPayload,
		response: {
			201: AuthRegisterResponse,
			400: BaseErrorResponse,
			401: BaseErrorResponse,
			500: BaseErrorResponse,
		},
	},
	authLogin: {
		method: "POST",
		path: "/v1/authentications",
		payload: AuthLoginPayload,
		summary: "User Login",
		response: {
			200: AuthLoginResponse,
			400: BaseErrorResponse,
			401: BaseErrorResponse,
			500: BaseErrorResponse,
		},
	},
	authExchange: {
		method: "POST",
		path: "/v1/authentications/exchange",
		summary: "Exchange Authentication",
		payload: AuthExchangePayload,
		response: {
			200: AuthExchangeResponse,
			400: BaseErrorResponse,
			401: BaseErrorResponse,
			500: BaseErrorResponse,
		},
	},
	authVerify: {
		method: "GET",
		path: "/v1/authentications",
		summary: "Verify Authentication",
		response: {
			200: BaseResponse,
			400: BaseErrorResponse,
			401: BaseErrorResponse,
			500: BaseErrorResponse,
		},
	},
	authRenew: {
		method: "PUT",
		path: "/v1/authentications",
		summary: "Renew Authentication",
		response: {
			200: AuthRenewResponse,
			400: BaseErrorResponse,
			401: BaseErrorResponse,
			500: BaseErrorResponse,
		},
	},
	authLogout: {
		method: "DELETE",
		path: "/v1/authentications",
		summary: "Logout Authentication",
		response: {
			200: AuthLogoutResponse,
			400: BaseErrorResponse,
			401: BaseErrorResponse,
			500: BaseErrorResponse,
		},
	},
});

import type z from "zod";
import type { schema as authSchema } from "./auth-schema";
import type { schema as baseAPISchema } from "./base";

export type BaseAPISchema = typeof baseAPISchema;

export type BaseIdResponse = z.infer<BaseAPISchema["BaseIdResponse"]>;
export type BaseResponse = z.infer<BaseAPISchema["BaseResponse"]>;
export type BaseResponses = z.infer<BaseAPISchema["BaseResponses"]>;
export type BaseErrorResponse = z.infer<BaseAPISchema["BaseErrorResponse"]>;
export type BaseMetadata = z.infer<BaseAPISchema["BaseMetadata"]>;

export type AuthSchema = typeof authSchema;

export type AuthRegisterPayload = z.infer<AuthSchema["AuthRegisterPayload"]>;
export type AuthLoginPayload = z.infer<AuthSchema["AuthLoginPayload"]>;
export type AuthExchangePayload = z.infer<AuthSchema["AuthExchangePayload"]>;

export type AuthRegisterResponse = z.infer<AuthSchema["AuthRegisterResponse"]>;
export type AuthLoginResponse = z.infer<AuthSchema["AuthLoginResponse"]>;
export type AuthExchangeResponse = z.infer<AuthSchema["AuthExchangeResponse"]>;
export type AuthVerifyResponse = z.infer<AuthSchema["AuthVerifyResponse"]>;
export type AuthRenewResponse = z.infer<AuthSchema["AuthRenewResponse"]>;
export type AuthLogoutResponse = z.infer<AuthSchema["AuthLogoutResponse"]>;

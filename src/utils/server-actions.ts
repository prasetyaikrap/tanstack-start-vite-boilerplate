import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import type { CookieTypeServer } from "@/types";
import {
	deleteCookiesServerFn,
	getCookiesServerFn,
	setCookiesServerFn,
} from "./helper.server";

export const setCookies = createServerFn({ method: "POST" })
	.validator(z.custom<CookieTypeServer[]>())
	.handler(async ({ data }) => setCookiesServerFn(data));

export const getCookies = createServerFn({ method: "GET" })
	.validator(z.array(z.string()))
	.handler(async ({ data }) => getCookiesServerFn(data));

export const deleteCookies = createServerFn({ method: "POST" })
	.validator(z.array(z.object({ name: z.string() })))
	.handler(async ({ data }) => deleteCookiesServerFn(data));

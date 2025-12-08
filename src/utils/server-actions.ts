import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server";
import type { CookieTypeServer } from "@/types";

export async function setCookies(cookieItems: CookieTypeServer[]) {
	cookieItems.forEach(({ name, value, ...cookieOptions }) => {
		setCookie(name, value, {
			httpOnly: true,
			secure: true,
			path: "/",
			...cookieOptions,
		});
	});
}

export async function getCookies(keys: string[]) {
	return keys.map((key) => ({
		name: key,
		value: getCookie(key),
	}));
}

export async function deleteCookies(
	cookies: Omit<CookieTypeServer, "value">[],
) {
	cookies.map((c) => deleteCookie(c.name, { path: "/", ...c }));
}

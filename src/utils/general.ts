import Cookies from "js-cookie";
import type { CookieType } from "@/types";

export function debounce<T extends (...args: never[]) => void>(
	callback: T,
	timeout = 300,
): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout>;

	return (...args: Parameters<T>) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			callback(...args);
		}, timeout);
	};
}

type NumberFormatOptions = {
	absoluteFormat?: boolean;
	locales?: Intl.LocalesArgument;
} & Intl.NumberFormatOptions;

export const IntlNumberFormat = (
	value: number,
	options?: NumberFormatOptions,
) => {
	const locales = options?.locales ?? "id-ID";
	const numberFormat = new Intl.NumberFormat(locales, {
		...options,
	}).format(Math.abs(value));

	if (options?.absoluteFormat && value < 0) return `(${numberFormat})`;
	return numberFormat;
};

type DownloadBlobFileProps = {
	file: Blob;
	filename?: string;
};
export function downloadBlobFile({
	file,
	filename = "file",
}: DownloadBlobFileProps) {
	const url = URL.createObjectURL(file);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

export async function setCookies(cookieItems: CookieType[]) {
	const defaultMaxAge = 365;
	cookieItems.forEach(({ name, value, ...cookie }) => {
		Cookies.set(name, value, {
			path: "/",
			secure: true,
			expires: defaultMaxAge,
			...cookie,
		});
	});
}

export async function getCookies(keys: string[]) {
	return keys.map((key) => ({
		name: key,
		value: Cookies.get(key),
	}));
}

export async function deleteCookies(keys: string[]) {
	keys.map((key) => Cookies.remove(key));
}

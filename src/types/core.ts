import type { ColumnDef, RowData } from "@tanstack/table-core";
import type { CookieAttributes } from "node_modules/@types/js-cookie";
import type { ReactNode } from "react";

export type BaseKey = string | number;
export type BaseRecord<T extends BaseKey = BaseKey> = {
	id: T;
};

export type Params = {
	slug?: string[] | string;
};

export type SearchParams = {
	preview?: string[] | string;
};

export type PageProps = {
	params: Promise<Params>;
	searchParams: Promise<SearchParams>;
};

export type GenerateMetadataProps = {
	params: Promise<Params>;
	searchParams: Promise<SearchParams>;
};

export type BaseSelectOptions<T = object> = {
	label: string;
	value: string;
	description?: string;
	item?: T;
	Icon?: ReactNode;
	disabled?: boolean;
	meta?: BaseSelectOptionsMeta;
};

export type BaseSelectOptionsMeta = {
	group?: string;
	sub_type?: string[];
};

export type ExtendedColumnDef<T extends RowData = RowData> = {
	type?: "default" | "date" | "currency" | "number";
	textAlign?: string;
	format?: string;
} & ColumnDef<T>;

export type AppError<TError = unknown> = {
	type: string;
	message: string;
	error?: TError;
};

export type CookieType = {
	name: string;
	value: string;
} & CookieAttributes;

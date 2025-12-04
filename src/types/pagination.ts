export type LogicalFilter = {
	field: string;
	value: any;
};

export type CrudSort = {
	field: string;
	order: "asc" | "desc";
};

export type CrudFilter = LogicalFilter;
export type CrudFilters = LogicalFilter[];
export type CrudSorting = CrudSort[];

export interface Pagination {
	/**
	 * Initial page index
	 * @default 1
	 */
	currentPage?: number;
	/**
	 * Initial number of items per page
	 * @default 10
	 */
	pageSize?: number;
	/**
	 * Whether to use server side pagination or not.
	 * @default "server"
	 */
	mode?: "client" | "server" | "off";
}

import type {
	ButtonProps,
	Combobox,
	ComboboxValueChangeDetails,
	NumberInputValueChangeDetails,
	SelectValueChangeDetails,
	TableRootProps,
} from "@chakra-ui/react";
import type { Column, Table } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { z } from "zod";
import type { UseTableReturnType } from "@/hooks/useTable";
import type { BaseRecord, BaseSelectOptions } from "@/types";

export type TablesProps<T extends BaseRecord = BaseRecord> = {
	name?: string;
} & UseTableReturnType<T>;

export type TableProps<T extends BaseRecord = BaseRecord> = {
	reactTable: Table<T>;
	core?: UseTableReturnType<T>["core"];
	id?: string;
	Title?: string | ReactNode | (() => ReactNode);
	pagination?: TablePaginationProps;
	filters?: TableFilter;
	actions?: TableActions[];
	chakra?: {
		tableRootProps?: TableRootProps;
	};
};

export type TableFilter = {
	resolver?: z.ZodObject;
	filtersDef: FilterOptions[];
	variant?: "default" | "floating-label";
	initialOpen?: boolean;
};

export type TableActions = {
	name: string;
	label: string;
	startElement?: ReactNode;
	endElement?: ReactNode;
	buttonProps?: ButtonProps;
	cell?: (props: ButtonProps) => ReactNode;
};

export type ColumnButtonProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	column: Column<any, any>;
};

export type PaginationProps = {
	current: number;
	pageCount: number;
	setCurrent: (page: number) => void;
};

export type CursorPaginationProps = {
	setCursorPage: ((cursor: string, direction: string) => void) | null;
	prevCursor: string | null;
	nextCursor: string | null;
	current: number;
	totalPage: number;
};

export type TablePaginationProps = {
	keepShowPanel?: boolean;
	showSizeChanger?: boolean;
	maxPageSize?: number;
	sizes?: number[];
	mode?: "default" | "cursor";
};

export type RefineMetaQuery = {
	total_rows: number;
	total_page: number;
	current_page: number;
	per_page: number;
	previous_cursor: string;
	next_cursor: string;
};

export type FiltersProps<TTableProps extends BaseRecord = BaseRecord> = {
	reactTable: TablesProps<TTableProps>["reactTable"];
	filterOptions?: TableFilter;
};

type BaseFilterOptions = {
	id: string;
	label: string;
	type?:
		| "text"
		| "number"
		| "select"
		| "select-multi"
		| "combobox"
		| "combobox-multi"
		| "daypicker";
	key?: string;
	defaultValue?: string | number | BaseSelectOptions[] | null;
	loading?: boolean;
};

export type TextFilterOptions = {
	defaultValue?: string;
	onValueChange?: (value: string) => void;
} & BaseFilterOptions;

export type NumberFilterOptions = {
	defaultValue?: number;
	onValueChange?: (value: NumberInputValueChangeDetails) => void;
	stepper?: boolean;
} & BaseFilterOptions;

export type SelectFilterOptions = {
	defaultValue?: BaseSelectOptions[];
	options?: BaseSelectOptions[];
	clearable?: boolean;
	render?: (props: BaseSelectOptions) => ReactNode;
	selectedRender?: (props: BaseSelectOptions[]) => ReactNode;
	onValueChange?: (props: SelectValueChangeDetails) => void;
} & BaseFilterOptions;

export type SelectMultiFilterOptions = {
	defaultValue?: BaseSelectOptions[];
	options?: BaseSelectOptions[];
	clearable?: boolean;
	render?: (props: BaseSelectOptions) => ReactNode;
	selectedRender?: (props: BaseSelectOptions[]) => ReactNode;
	onValueChange?: (props: SelectValueChangeDetails) => void;
} & BaseFilterOptions;

export type ComboboxFilterOptions = {
	defaultValue?: BaseSelectOptions[];
	options?: BaseSelectOptions[];
	clearable?: boolean;
	emptyMessage?: string;
	limit?: number;
	render?: (props: BaseSelectOptions) => ReactNode;
	onValueChange?: (item: ComboboxValueChangeDetails) => void;
	onInputValueChange?: (props: ComboboxInputValueChangeProps) => void;
} & BaseFilterOptions;

export type ComboboxMultiFilterOptions = {
	defaultValue?: BaseSelectOptions[];
	options?: BaseSelectOptions[];
	clearable?: boolean;
	emptyMessage?: string;
	limit?: number;
	render?: (props: BaseSelectOptions) => ReactNode;
	onValueChange?: (item: ComboboxValueChangeDetails) => void;
	onInputValueChange?: (props: ComboboxInputValueChangeProps) => void;
} & BaseFilterOptions;

type ComboboxInputValueChangeProps = {
	details: Combobox.InputValueChangeDetails;
	set: (items: BaseSelectOptions[]) => void;
	filter: (inputValue: string) => void;
};

export type DaypickerFilterOptions = {
	defaultValue?: string;
	clearable?: boolean;
	onValueChange?: (date: Date | undefined, dateString: string) => void;
	dateFormat?: string;
} & BaseFilterOptions;

export type FilterOptions =
	| TextFilterOptions
	| NumberFilterOptions
	| SelectFilterOptions
	| SelectMultiFilterOptions
	| ComboboxFilterOptions
	| ComboboxMultiFilterOptions
	| DaypickerFilterOptions;

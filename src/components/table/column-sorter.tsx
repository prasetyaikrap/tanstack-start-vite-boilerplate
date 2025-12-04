import { IconButton } from "@chakra-ui/react";
import type { SortDirection } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { ColumnButtonProps } from "./type";

export function ColumnSorter({ column }: ColumnButtonProps) {
	if (!column.getCanSort()) {
		return null;
	}

	const sorted = column.getIsSorted();

	return (
		<IconButton
			data-testid="btn_sorter-icon"
			aria-label="Sort"
			size="xs"
			onClick={column.getToggleSortingHandler()}
			variant="ghost"
			colorPalette="teal"
		>
			<ColumnSorterIcon sorted={sorted} />
		</IconButton>
	);
}

function ColumnSorterIcon({ sorted }: { sorted: false | SortDirection }) {
	if (sorted === "asc")
		return <ChevronDown data-testid="btn_icon-sort-asc" size={18} />;
	if (sorted === "desc")
		return <ChevronUp data-testid="btn_icon-sort-desc" size={18} />;
	return <ChevronsUpDown data-testid="btn_icon-sort-selector" size={18} />;
}

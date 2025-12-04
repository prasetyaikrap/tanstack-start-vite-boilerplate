import { HStack, Text } from "@chakra-ui/react";
import type { Cell } from "@tanstack/react-table";
import { format } from "date-fns";
import { match } from "ts-pattern";
import type { ExtendedColumnDef } from "@/types";
import { IntlNumberFormat } from "@/utils/general";

type CellRenderProps<T> = {
	cell: Cell<T, unknown>;
};

export function CellRender<T>({ cell }: CellRenderProps<T>) {
	const columnDef = cell.column.columnDef as ExtendedColumnDef;
	const strFormat = columnDef.format;
	const type = columnDef.type;

	return match({ type, format: strFormat })
		.with({ type: "date" }, () => {
			const value = (cell.getValue() as string) || "";
			return (
				<Text w="full" textAlign={columnDef.textAlign}>
					{value ? format(value, columnDef.format || "dd MMMM yyyy") : "-"}
				</Text>
			);
		})
		.with({ type: "currency", format: "IDR" }, () => {
			const value = (cell.getValue() as number) || 0;
			return (
				<HStack w="full" justifyContent="space-between">
					<Text>Rp</Text>
					<Text textAlign={columnDef.textAlign || "right"}>
						{IntlNumberFormat(value, {
							currency: "IDR",
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</Text>
				</HStack>
			);
		})
		.with({ type: "currency", format: "USD" }, () => {
			const value = (cell.getValue() as number) || 0;
			return (
				<HStack w="full" justifyContent="space-between">
					<Text>Rp</Text>
					<Text textAlign={columnDef.textAlign || "right"}>
						{IntlNumberFormat(value, {
							locales: "US-us",
							currency: "USD",
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</Text>
				</HStack>
			);
		})
		.with({ type: "number", format: "IDR" }, () => {
			const value = (cell.getValue() as number) || 0;
			return (
				<Text w="full" textAlign={columnDef.textAlign || "right"}>
					{IntlNumberFormat(value, {
						currency: "IDR",
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
				</Text>
			);
		})
		.with({ type: "number", format: "USD" }, () => {
			const value = (cell.getValue() as number) || 0;
			return (
				<Text w="full" textAlign={columnDef.textAlign || "right"}>
					{IntlNumberFormat(value, {
						locales: "US-us",
						currency: "USD",
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
				</Text>
			);
		})
		.otherwise(() => {
			const value = cell.getValue() as string | number;
			return (
				<Text w="full" textAlign={columnDef.textAlign}>
					{value || "-"}
				</Text>
			);
		});
}

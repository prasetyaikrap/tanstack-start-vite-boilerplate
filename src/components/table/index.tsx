"use client";
import {
	Box,
	ButtonGroup,
	Card,
	Table as ChakraTable,
	Heading,
	HStack,
	IconButton,
	Pagination,
	Separator,
	Text,
	VStack,
} from "@chakra-ui/react";
import { flexRender } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { EmptyStateComponent } from "@/components/ui/empty-state";
import type { BaseRecord, ExtendedColumnDef } from "@/types";
import { ActionSection } from "./action-section";
import { CellRender } from "./cell";
import { ColumnSorter } from "./column-sorter";
import Filters from "./filter";
import { LoadingState } from "./loading";
import type { TableProps } from "./type";

export default function Table<T extends BaseRecord = BaseRecord>({
	id = "default",
	Title,
	filters,
	actions = [],
	chakra,
	core,
	reactTable,
}: TableProps<T>) {
	const {
		getHeaderGroups,
		getPaginationRowModel,
		getState,
		getCoreRowModel,
		setPageIndex,
		setPageSize,
	} = reactTable;

	const headerGroups = getHeaderGroups();
	const rowData = getPaginationRowModel().rows;

	const tableState = getState();
	const refineMetadata = core?.tableQuery?.data?.metadata;

	const manualTotal = getCoreRowModel().rows.length;
	const manualPageSize = tableState.pagination.pageSize;
	const manualCurrentPage = tableState.pagination.pageIndex + 1;
	const manualPageCount = Math.ceil(
		getCoreRowModel().rows.length / manualPageSize,
	);

	const manualSetCurrent = useCallback(
		(page: number) => {
			setPageIndex(page - 1);
		},
		[setPageIndex],
	);

	const generateTableConfig = () => {
		if (core) {
			const isFetching = core.tableQuery.isFetching;
			const isLoading = core.tableQuery.isLoading;
			const setCursorPage = (cursor: string, direction: string) => {
				const increment = direction === "next" ? 1 : -1;
				core.setFilters([
					{
						field: "_cursor",
						value: cursor || undefined,
					},
					{
						field: "_direction",
						value: direction,
					},
					{
						field: "_page",
						value: (refineMetadata?.current_page || 1) + increment,
					},
				]);
			};
			return {
				isFetching,
				isLoading,
				isDataEmpty: !isFetching && !isLoading && rowData.length <= 0,
				isDataExist: rowData.length > 0,
				total: refineMetadata?.total_rows,
				current: core.currentPage,
				pageCount: core.pageCount,
				setCurrent: core.setCurrentPage,
				pageSize: core.pageSize,
				setPageSize: core.setPageSize,
				setCursorPage,
			};
		}

		return {
			isFetching: false,
			isLoading: false,
			isDataEmpty: rowData.length <= 0,
			isDataExist: rowData.length > 0,
			total: manualTotal,
			current: manualCurrentPage,
			pageCount: manualPageCount,
			setCurrent: manualSetCurrent,
			pageSize: manualPageSize,
			setPageSize,
			setCursorPage: null,
		};
	};

	const tableConfig = generateTableConfig();

	const RenderTitle = useCallback(() => {
		if (!Title) return <Box />;

		if (typeof Title === "string") {
			return (
				<Heading as="h3" size="lg">
					{Title}
				</Heading>
			);
		}

		if (typeof Title === "function") {
			return Title();
		}

		return Title;
	}, [Title]);

	const renderCardHeader = Title || actions.length > 0;

	return (
		<VStack w="full" gap="1em" data-testid={`component_refine-table-${id}`}>
			{filters && <Filters reactTable={reactTable} filterOptions={filters} />}
			<Card.Root w="full">
				{renderCardHeader && (
					<Card.Header>
						<HStack w="full" justifyContent="space-between">
							<RenderTitle />
							<ActionSection actions={actions} />
						</HStack>
						<Separator w="full" colorPalette="teal" />
					</Card.Header>
				)}
				<Card.Body>
					<ChakraTable.ScrollArea w="full">
						<ChakraTable.Root
							data-testid={`component_table-${id}`}
							variant="outline"
							w="full"
							interactive
							{...chakra?.tableRootProps}
						>
							<ChakraTable.Header>
								{headerGroups.map((headerGroup) => {
									return (
										<ChakraTable.Row
											key={headerGroup.id}
											id={headerGroup.id}
											data-testid={`table-header_row_${headerGroup.id}`}
										>
											{headerGroup.headers.map((header) => {
												return (
													<ChakraTable.ColumnHeader
														key={header.id}
														id={header.id}
														minW={header.column.columnDef.minSize}
														maxW={header.column.columnDef.maxSize}
														w={header.column.columnDef.size}
														data-testid={`table-header_${header.column.id}`}
													>
														<HStack justifyContent="space-between">
															<Text
																w="full"
																textAlign={
																	(header.column.columnDef as ExtendedColumnDef)
																		.textAlign ?? "left"
																}
																data-testid={`text_${header.column.id}`}
															>
																{flexRender(
																	header.column.columnDef.header,
																	header.getContext(),
																)}
															</Text>
															<ColumnSorter column={header.column} />
														</HStack>
													</ChakraTable.ColumnHeader>
												);
											})}
										</ChakraTable.Row>
									);
								})}
							</ChakraTable.Header>

							<ChakraTable.Body
								position="relative"
								height={tableConfig.isLoading ? "200px" : "auto"}
							>
								{(tableConfig.isLoading || tableConfig.isFetching) && (
									<ChakraTable.Row h="0" p="0">
										<ChakraTable.Cell
											colSpan={headerGroups[0]?.headers.length || 1}
											h="0"
											p="0"
										>
											<LoadingState />
										</ChakraTable.Cell>
									</ChakraTable.Row>
								)}
								{tableConfig.isDataEmpty && (
									<ChakraTable.Row
										data-testid={`table-body-row_empty-state-row`}
									>
										<ChakraTable.Cell
											colSpan={headerGroups[0]?.headers.length || 1}
											textAlign="center"
										>
											<EmptyStateComponent />
										</ChakraTable.Cell>
									</ChakraTable.Row>
								)}
								{tableConfig.isDataExist &&
									rowData.map((row) => {
										return (
											<ChakraTable.Row
												key={row.id}
												id={row.id}
												data-testid={`table-body-row_${row.id}`}
											>
												{row.getVisibleCells().map((cell) => {
													return (
														<ChakraTable.Cell
															color="blackAlpha.800"
															_dark={{ color: "white" }}
															key={cell.id}
															id={cell.id}
															data-testid={`table-body-row_${cell.id}`}
														>
															<CellRender cell={cell} />
														</ChakraTable.Cell>
													);
												})}
											</ChakraTable.Row>
										);
									})}
							</ChakraTable.Body>
						</ChakraTable.Root>
					</ChakraTable.ScrollArea>
					<HStack w="full" mt="1em" justifyContent="space-between">
						<Box />
						<Pagination.Root
							count={tableConfig.total}
							pageSize={tableConfig.pageSize}
							page={tableConfig.current}
						>
							<ButtonGroup attached variant="ghost" size="sm" wrap="wrap">
								<Pagination.PrevTrigger asChild>
									<IconButton
										data-testid={`btn_prev-pagination-table-${id}`}
										onClick={() =>
											tableConfig.setCurrent(tableConfig.current - 1)
										}
									>
										<ChevronLeft />
									</IconButton>
								</Pagination.PrevTrigger>

								<Pagination.Items
									render={(page) => (
										<IconButton
											data-testid={`btn_current-pagination-${id}-${page.value}`}
											variant={{ base: "ghost", _selected: "outline" }}
											onClick={() => tableConfig.setCurrent(page.value)}
										>
											{page.value}
										</IconButton>
									)}
								/>

								<Pagination.NextTrigger asChild>
									<IconButton
										data-testid={`btn_next-pagination-table-${id}`}
										onClick={() =>
											tableConfig.setCurrent(tableConfig.current + 1)
										}
									>
										<ChevronRight />
									</IconButton>
								</Pagination.NextTrigger>
							</ButtonGroup>
						</Pagination.Root>
					</HStack>
				</Card.Body>
			</Card.Root>
		</VStack>
	);
}

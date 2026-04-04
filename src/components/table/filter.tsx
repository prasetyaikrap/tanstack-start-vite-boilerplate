import {
	Accordion,
	Button,
	Card,
	Heading,
	HStack,
	SimpleGrid,
	VStack,
} from "@chakra-ui/react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { isNull, isNumber, isUndefined } from "lodash";
import { ListFilter } from "lucide-react";
import { type FormEvent, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { match } from "ts-pattern";
import { FormCombobox } from "@/components/forms/form-combobox";
import { FormDaypicker } from "@/components/forms/form-daypicker";
import { FormInput } from "@/components/forms/form-input";
import { FormNumber } from "@/components/forms/form-number";
import { FormSelect } from "@/components/forms/form-select";
import { useTranslation } from "@/hooks/useTranslation";
import type {
	BaseRecord,
	BaseSelectOptions,
	ExtendedColumnFilter,
} from "@/types";
import type {
	ComboboxFilterOptions,
	ComboboxMultiFilterOptions,
	DaypickerFilterOptions,
	FiltersProps,
	NumberFilterOptions,
	SelectFilterOptions,
	SelectMultiFilterOptions,
	TableFilter,
	TextFilterOptions,
} from "./type";

export default function Filters<TTableProps extends BaseRecord = BaseRecord>({
	reactTable,
	filterOptions,
}: FiltersProps<TTableProps>) {
	const { translate } = useTranslation();
	const { setColumnFilters } = reactTable;
	const filters = filterOptions?.filtersDef || [];
	const initialOpen = filterOptions?.initialOpen ?? true;
	const generateDefaultValues = (refColumnFilterState: ColumnFiltersState) => {
		const defaultFilters = filters.reduce((result, current) => {
			const valueFromRef = refColumnFilterState.find(
				(f) => f.id === current.id,
			)?.value;
			const filterType = current.type || "text";
			// handle defaultValue as BaseSelectOptions array
			if (
				["select", "select-multi", "combobox", "combobox-multi"].includes(
					filterType,
				)
			) {
				if (
					!isUndefined(valueFromRef) &&
					!isNull(valueFromRef) &&
					valueFromRef !== ""
				) {
					const values = String(valueFromRef)
						.split(",")
						.map((val) => {
							return { label: val, value: val };
						});
					return {
						...result,
						[current.id]: values,
					};
				}
				return {
					...result,
					[current.id]: [],
				};
			}

			// handle defaultValue as a number
			if (["number"].includes(filterType)) {
				if (isNumber(valueFromRef)) {
					return {
						...result,
						[current.id]: valueFromRef,
					};
				}
				return {
					...result,
					[current.id]: 0,
				};
			}

			// handler defaultValue as string (e.g text, daypicker)
			return {
				...result,
				[current.id]: valueFromRef ?? "",
			};
		}, {});

		return defaultFilters;
	};

	const [defaultValues] = useState<Record<string, any>>(() => {
		const filterState = reactTable.getState().columnFilters;
		const defaultFilters = generateDefaultValues(filterState);
		return defaultFilters;
	});

	const filterFormProps = useForm({
		defaultValues,
	});

	const { reset } = filterFormProps;

	const onReset = (e: FormEvent) => {
		e.preventDefault();
		setColumnFilters([]);
		reset();
	};

	const onSubmit = (data: Record<string, any>) => {
		const permanentField = reactTable
			.getState()
			.columnFilters.filter(
				(filter: ExtendedColumnFilter) => filter.is_permanent,
			)
			.map((f) => f.id);
		const filterState: ExtendedColumnFilter[] = Object.entries(data).reduce(
			(res, curr) => {
				const [key, value] = curr;
				const isArray = Array.isArray(value);

				if (!value || (isArray && value.length <= 0)) return res;

				if (isArray) {
					res = [
						...res,
						{
							id: key,
							value: (value as BaseSelectOptions[])
								.map((v) => v.value)
								.join(","),
							is_permanent: permanentField.includes(key),
						},
					];
					return res;
				}

				res = [
					...res,
					{
						id: key,
						value: value,
						is_permanent: permanentField.includes(key),
					},
				];
				return res;
			},
			[] as ExtendedColumnFilter[],
		);

		setColumnFilters(filterState);
	};

	return (
		<Card.Root
			as="form"
			onSubmit={filterFormProps.handleSubmit(onSubmit)}
			onReset={onReset}
			w="full"
			size="sm"
		>
			<Card.Body>
				<Accordion.Root
					variant="plain"
					collapsible
					defaultValue={initialOpen ? ["table-filter"] : undefined}
				>
					<Accordion.Item value="table-filter">
						<Accordion.ItemTrigger cursor="pointer">
							<HStack w="full" justifyContent="space-between">
								<HStack gap="1em">
									<ListFilter size={20} />
									<Heading as="h4" size="md">
										Filters
									</Heading>
								</HStack>
								<Accordion.ItemIndicator />
							</HStack>
						</Accordion.ItemTrigger>
						<Accordion.ItemContent>
							<Accordion.ItemBody as={VStack} gap="2em">
								<SimpleGrid
									w="full"
									columns={{ base: 2, md: 3, xl: 4 }}
									gap="1em"
								>
									{filters.map((filter) => {
										return (
											<InputItem
												key={filter.id}
												filter={filter}
												formProps={filterFormProps}
												variant={filterOptions?.variant}
											/>
										);
									})}
								</SimpleGrid>
								<HStack w="full" justifyContent="flex-end">
									<Button
										type="reset"
										variant="outline"
										size="sm"
										colorPalette="teal"
										minW={{ base: "50px", md: "100px" }}
									>
										{translate("buttons.reset")}
									</Button>

									<Button
										type="submit"
										variant="surface"
										size="sm"
										colorPalette="teal"
										minW={{ base: "50px", md: "100px" }}
									>
										{translate("buttons.filter")}
									</Button>
								</HStack>
							</Accordion.ItemBody>
						</Accordion.ItemContent>
					</Accordion.Item>
				</Accordion.Root>
			</Card.Body>
		</Card.Root>
	);
}

type InputItemProps = {
	filter: TableFilter["filtersDef"][number];
	formProps: UseFormReturn;
	variant?: TableFilter["variant"];
};

function InputItem({ formProps, filter, variant = "default" }: InputItemProps) {
	const useFloatingLabel = variant === "floating-label";
	return match(filter.type)
		.with("number", () => {
			const { id, label, onValueChange, stepper } =
				filter as NumberFilterOptions;
			return (
				<FormNumber
					id={id}
					label={label}
					formProps={formProps}
					inputProps={{ size: "sm" }}
					labelProps={{ fontSize: "sm", css: { top: "2" } }}
					onValueChange={onValueChange}
					stepper={stepper}
					floatingLabel={useFloatingLabel}
				/>
			);
		})
		.with("select", () => {
			const {
				id,
				label,
				options = [],
				clearable,
				render,
				selectedRender,
				onValueChange,
				loading,
			} = filter as SelectFilterOptions;
			return (
				<FormSelect
					id={id}
					label={label}
					formProps={formProps}
					options={options}
					selectProps={{
						size: "sm",
					}}
					labelProps={{ fontSize: "sm", css: { top: "2" } }}
					clearable={clearable}
					render={render}
					selectedRender={selectedRender}
					onChangeValue={onValueChange}
					loading={loading}
					floatingLabel={useFloatingLabel}
				/>
			);
		})
		.with("select-multi", () => {
			const {
				id,
				label,
				options = [],
				clearable,
				render,
				selectedRender,
				onValueChange,
				loading,
			} = filter as SelectMultiFilterOptions;
			return (
				<FormSelect
					id={id}
					label={label}
					formProps={formProps}
					options={options}
					selectProps={{
						size: "sm",
						multiple: true,
					}}
					labelProps={{ fontSize: "sm", css: { top: "2" } }}
					clearable={clearable}
					render={render}
					selectedRender={selectedRender}
					onChangeValue={onValueChange}
					loading={loading}
					floatingLabel={useFloatingLabel}
				/>
			);
		})
		.with("combobox", () => {
			const {
				id,
				label,
				options = [],
				clearable,
				render,
				onValueChange,
				onInputValueChange,
				limit = 20,
				loading,
				emptyMessage,
			} = filter as ComboboxFilterOptions;
			return (
				<FormCombobox
					id={id}
					label={label}
					formProps={formProps}
					options={options}
					comboboxProps={{
						size: "sm",
					}}
					labelProps={{ fontSize: "sm", css: { top: "2" } }}
					clearable={clearable}
					render={render}
					onValueChange={onValueChange}
					onInputValueChange={onInputValueChange}
					loading={loading}
					limit={limit}
					emptyMessage={emptyMessage}
					floatingLabel={useFloatingLabel}
				/>
			);
		})
		.with("combobox-multi", () => {
			const {
				id,
				label,
				options = [],
				clearable,
				render,
				onValueChange,
				onInputValueChange,
				limit = 20,
				loading,
				emptyMessage,
			} = filter as ComboboxMultiFilterOptions;
			return (
				<FormCombobox
					id={id}
					label={label}
					formProps={formProps}
					options={options}
					comboboxProps={{
						size: "sm",
						multiple: true,
					}}
					labelProps={{ fontSize: "sm", css: { top: "2" } }}
					clearable={clearable}
					render={render}
					onValueChange={onValueChange}
					onInputValueChange={onInputValueChange}
					loading={loading}
					limit={limit}
					emptyMessage={emptyMessage}
					floatingLabel={useFloatingLabel}
				/>
			);
		})
		.with("daypicker", () => {
			const { id, label, clearable, onValueChange, loading } =
				filter as DaypickerFilterOptions;
			return (
				<FormDaypicker
					id={id}
					label={label}
					formProps={formProps}
					labelProps={{ fontSize: "sm", css: { top: "2" } }}
					menuProps={{ size: "sm" }}
					triggerProps={{ size: "sm" }}
					clearable={clearable}
					loading={loading}
					onValueChange={onValueChange}
					floatingLabel={useFloatingLabel}
				/>
			);
		})
		.otherwise(() => {
			const { id, label, onValueChange } = filter as TextFilterOptions;
			return (
				<FormInput
					id={id}
					label={label}
					formProps={formProps}
					inputProps={{ size: "sm" }}
					labelProps={{ fontSize: "sm", css: { top: "2" } }}
					onValueChange={onValueChange}
					floatingLabel={useFloatingLabel}
				/>
			);
		});
}

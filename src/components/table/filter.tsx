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
import { ListFilter } from "lucide-react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { match } from "ts-pattern";
import { FormCombobox } from "@/components/forms/form-combobox";
import { FormDaypicker } from "@/components/forms/form-daypicker";
import { FormInput } from "@/components/forms/form-input";
import { FormNumber } from "@/components/forms/form-number";
import { FormSelect } from "@/components/forms/form-select";
import { useTranslation } from "@/hooks/useTranslation";
import type { BaseRecord, BaseSelectOptions } from "@/types";
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
	const defaultValues = filters.reduce((result, current) => {
		const filterType = current.type || "text";

		// handle defaultValue as BaseSelectOptions array
		if (
			["select", "select-multi", "combobox", "combobox-multi"].includes(
				filterType,
			)
		) {
			return {
				...result,
				[current.id]: (current.defaultValue as BaseSelectOptions[]) || [],
			};
		}

		// handle defaultValue as a number
		if (["number"].includes(filterType)) {
			return {
				...result,
				[current.id]: (current.defaultValue as number) || 0,
			};
		}

		// handler defaultValue as string (e.g text, daypicker)
		return {
			...result,
			[current.id]: current.defaultValue || "",
		};
	}, {});

	const filterFormProps = useForm({
		defaultValues,
	});

	const { reset } = filterFormProps;

	const onReset = () => {
		setColumnFilters([]);
		return reset(defaultValues);
	};

	const onSubmit = (data: Record<string, any>) => {
		const filterState: ColumnFiltersState = Object.entries(data).reduce(
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
						},
					];
					return res;
				}

				res = [
					...res,
					{
						id: key,
						value: value,
					},
				];
				return res;
			},
			[] as ColumnFiltersState,
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

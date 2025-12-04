"use client";

import {
	Center,
	createListCollection,
	defineStyle,
	Field,
	Select,
	type SelectRootProps,
	type SelectValueChangeDetails,
	Span,
	Spinner,
	Stack,
	Text,
} from "@chakra-ui/react";
import { type ReactNode, useState } from "react";
import { type Control, Controller, type FieldValues } from "react-hook-form";
import { PortalWrapper } from "@/components/ui/portal-wrapper";
import type { BaseSelectOptions } from "@/types";
import type { BaseFormInputProps } from "./types";

type FormSelectProps = {
	options: BaseSelectOptions[];
	placeholder?: string;
	selectProps?: Omit<SelectRootProps, "collection" | "name" | "value">;
	onChangeValue?: (item: SelectValueChangeDetails) => void;
	clearable?: boolean;
	portal?: boolean;
	render?: (option: BaseSelectOptions) => ReactNode;
	selectedRender?: (option: BaseSelectOptions[]) => ReactNode;
} & BaseFormInputProps;

export function FormSelect({
	id,
	label,
	formProps,
	placeholder,
	options,
	clearable = true,
	fieldProps,
	labelProps,
	selectProps,
	portal = true,
	render,
	selectedRender,
	onChangeValue,
	loading = false,
	floatingLabel = false,
}: FormSelectProps) {
	const {
		watch,
		control,
		formState: { errors },
	} = formProps;

	const selectOptions = createListCollection({
		items: options.map((opt) => ({
			value: opt.value,
			label: opt.label,
			description: opt.description || "",
			Icon: opt.Icon,
			group: opt.meta?.group,
			item: opt,
		})),
	});

	const isEmpty = !loading && selectOptions.items.length <= 0;
	const isExist = !loading && selectOptions.items.length > 0;

	const fieldValue = watch(id) as string[] | number[];
	const [focused, setFocused] = useState(false);
	const shouldFloat = (fieldValue ?? []).length > 0 || focused;
	const canClear = clearable && (fieldValue ?? []).length > 0;

	const floatingStyles = defineStyle({
		pos: "absolute",
		bg: "bg",
		px: "0.5",
		top: "2.5",
		insetStart: "3",
		fontWeight: "normal",
		pointerEvents: "none",
		transition: "position",
		color: "fg.muted",
		"&[data-float]": {
			top: "-3",
			insetStart: "2",
			color: "fg",
		},
	});

	return (
		<Field.Root invalid={!!errors[id]} {...fieldProps}>
			{!floatingLabel && (
				<Field.Label {...labelProps}>
					{label} <Field.RequiredIndicator />
				</Field.Label>
			)}
			<Controller
				control={control as unknown as Control<FieldValues>}
				name={id}
				render={({ field }) => (
					<Select.Root
						name={field.name}
						value={((field.value as BaseSelectOptions[]) || []).map(
							(v) => v.value,
						)}
						onValueChange={(item) => {
							field.onChange(item.items);
							onChangeValue?.(item);
						}}
						onInteractOutside={() => field.onBlur()}
						collection={selectOptions}
						disabled={field.disabled || loading}
						data-float={shouldFloat || undefined}
						{...selectProps}
					>
						<Select.HiddenSelect />
						<Select.Control>
							<Select.Trigger cursor="pointer" data-testid={`select_${id}`}>
								{selectedRender ? (
									<Select.ValueText placeholder={placeholder}>
										{selectedRender(field.value as BaseSelectOptions[])}
									</Select.ValueText>
								) : (
									<Select.ValueText placeholder={placeholder} />
								)}
							</Select.Trigger>
							<Select.IndicatorGroup>
								{canClear && (
									<Select.ClearTrigger
										cursor="pointer"
										data-testid={`btn_select-clear-${id}`}
									/>
								)}
								{loading && (
									<Spinner
										data-testid={`component_select-control-spinner-${id}`}
										size="xs"
										borderWidth="1.5px"
										color="fg.muted"
									/>
								)}
								<Select.Indicator />
							</Select.IndicatorGroup>
						</Select.Control>
						<PortalWrapper portal={portal}>
							<Select.Positioner>
								<Select.Content
									onFocus={() => setFocused(true)}
									onBlur={() => setFocused(false)}
									data-testid={`dropdown_select-${id}`}
								>
									{loading && (
										<Center py="0.5em">
											<Spinner
												data-testid={`component_select-dd-spinner-${id}`}
												size="sm"
												borderWidth="1.5px"
												color="fg.muted"
											/>
										</Center>
									)}
									{isEmpty && (
										<Center py="0.5em">
											<Text
												data-testid={`txt_select-no-option-${id}`}
												color="fg.muted"
											>
												No Options
											</Text>
										</Center>
									)}
									{isExist &&
										selectOptions.items.map((option) => (
											<Select.Item
												item={option}
												key={option.value}
												data-testid={`select-option_${id}-${option.value}`}
											>
												{render ? (
													render(option)
												) : (
													<DefaultSelectItemRender option={option} />
												)}
												<Select.ItemIndicator
													color="blackAlpha.800"
													_dark={{ color: "white" }}
												/>
											</Select.Item>
										))}
								</Select.Content>
							</Select.Positioner>
						</PortalWrapper>
					</Select.Root>
				)}
			/>
			{floatingLabel && (
				<Field.Label
					{...labelProps}
					css={{ ...floatingStyles, ...labelProps?.css }}
					data-float={shouldFloat || undefined}
					data-testid={`txt_label-${id}`}
					_dark={{ bg: "#111111" }}
				>
					{label} <Field.RequiredIndicator />
				</Field.Label>
			)}
			<Field.ErrorText>{errors[id]?.message as string}</Field.ErrorText>
		</Field.Root>
	);
}

type DefaultSelectItemRenderProps = {
	option: BaseSelectOptions;
};

function DefaultSelectItemRender({ option }: DefaultSelectItemRenderProps) {
	return (
		<Stack gap="0">
			<Select.ItemText color="blackAlpha.800" _dark={{ color: "white" }}>
				{option.label}
			</Select.ItemText>
			<Span color="fg.muted" textStyle="xs">
				{option.description}
			</Span>
		</Stack>
	);
}

import {
	Button,
	type ButtonProps,
	defineStyle,
	Field,
	HStack,
	Popover,
	type PopoverRootProps,
	Text,
} from "@chakra-ui/react";
import { format, formatISO, parseISO } from "date-fns";
import { Calendar, CircleX } from "lucide-react";
import { useState } from "react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { type Control, Controller, type FieldValues } from "react-hook-form";
import { PortalWrapper } from "@/components/ui/portal-wrapper";
import customDaypickerStyles from "@/styles/daypicker.module.css";
import type { BaseFormInputProps } from "./types";

type FormDaypickerProps = {
	daypickerProps?: Omit<DayPickerProps, "mode">;
	menuProps?: Omit<PopoverRootProps, "children">;
	triggerProps?: ButtonProps;
	onValueChange?: (date: Date | undefined, dateString: string) => void;
	portal?: boolean;
	clearable?: boolean;
	dateFormat?: string;
} & BaseFormInputProps;

export function FormDaypicker({
	id,
	label,
	formProps,
	floatingLabel = false,
	portal = true,
	onValueChange,
	labelProps,
	fieldProps,
	daypickerProps,
	menuProps,
	triggerProps,
	dateFormat = "dd MMMM yyyy",
	clearable = true,
}: FormDaypickerProps) {
	const {
		setValue,
		control,
		formState: { errors },
		watch,
	} = formProps;

	const fieldValue = watch(id) as string;
	const [focused, setFocused] = useState(false);
	const shouldFloat = (fieldValue ?? "").length > 0 || focused;
	const canClear = clearable && (fieldValue ?? "").length > 0;

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
				<Field.Label data-testid={`txt_label-${id}`} {...labelProps}>
					{label} <Field.RequiredIndicator />
				</Field.Label>
			)}
			<Controller
				control={control as unknown as Control<FieldValues>}
				name={id}
				render={({ field }) => {
					return (
						<Popover.Root
							lazyMount
							positioning={{ placement: "bottom-start" }}
							{...menuProps}
						>
							<Popover.Trigger asChild data-testid={`select-daypicker_${id}`}>
								<Button
									w="full"
									bg="transparent"
									variant="outline"
									{...triggerProps}
								>
									<HStack w="full" justifyContent="space-between">
										<Text data-testid={`txt_date-${id}`}>
											{field.value ? format(field.value, dateFormat) : ""}
										</Text>
										<HStack>
											{canClear && (
												<CircleX
													cursor="pointer"
													onClick={(e) => {
														e.stopPropagation();
														setValue(id, "");
													}}
												/>
											)}
											<Calendar />
										</HStack>
									</HStack>
								</Button>
							</Popover.Trigger>
							<PortalWrapper portal={portal}>
								<Popover.Positioner>
									<Popover.Content
										onFocus={() => setFocused(true)}
										onBlur={() => setFocused(false)}
										data-testid={`dropdown_daypicker-${id}`}
									>
										<Popover.Body>
											<DayPicker
												mode="single"
												animate
												showOutsideDays
												fixedWeeks
												navLayout="around"
												captionLayout="dropdown-years"
												classNames={customDaypickerStyles}
												required={Boolean(fieldProps?.required)}
												selected={
													field.value
														? parseISO(field.value as string)
														: undefined
												}
												onSelect={(date: Date | undefined) => {
													const dateString = date ? formatISO(date) : "";
													field.onChange(dateString);
													onValueChange?.(date, dateString);
												}}
												{...(daypickerProps as Omit<
													DayPickerProps,
													"mode" | "selected" | "required"
												>)}
											/>
										</Popover.Body>
									</Popover.Content>
								</Popover.Positioner>
							</PortalWrapper>
						</Popover.Root>
					);
				}}
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

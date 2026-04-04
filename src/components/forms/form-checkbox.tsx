import { Checkbox, Field } from "@chakra-ui/react";
import { type Control, Controller, type FieldValues } from "react-hook-form";
import type { BaseFormInputProps } from "./types";

type FormCheckboxProps<TFieldValues extends FieldValues = FieldValues> = {
	checkboxProps?: Omit<Checkbox.RootProps, "checked" | "onCheckedChange">;
	labelProps?: Checkbox.LabelProps;
	onValueChange?: (value: boolean | "indeterminate") => void;
} & Omit<BaseFormInputProps<TFieldValues, any, TFieldValues>, "labelProps">;

export function FormCheckbox<TFieldValues extends FieldValues = FieldValues>({
	id,
	label,
	formProps,
	onValueChange,
	labelProps,
	fieldProps,
	checkboxProps,
}: FormCheckboxProps<TFieldValues>) {
	const {
		control,
		formState: { errors },
	} = formProps;

	return (
		<Controller
			control={control as unknown as Control<FieldValues>}
			name={id}
			render={({ field }) => (
				<Field.Root
					invalid={!!errors[id]}
					disabled={field.disabled}
					{...fieldProps}
				>
					<Checkbox.Root
						checked={field.value}
						onCheckedChange={({ checked }) => {
							field.onChange(checked);
							onValueChange?.(checked);
						}}
						{...checkboxProps}
					>
						<Checkbox.HiddenInput />
						<Checkbox.Control cursor="pointer" />
						<Checkbox.Label {...labelProps}>{label}</Checkbox.Label>
					</Checkbox.Root>
					<Field.ErrorText>{errors[id]?.message as string}</Field.ErrorText>
				</Field.Root>
			)}
		/>
	);
}

import type { FieldLabelProps, FieldRootProps } from "@chakra-ui/react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

export type BaseFormInputProps<
	TFieldValues extends FieldValues = FieldValues,
	TContext = any,
	TTransformValue = TFieldValues,
> = {
	id: Path<TFieldValues>;
	label: string;
	formProps: UseFormReturn<TFieldValues, TContext, TTransformValue>;
	floatingLabel?: boolean;
	fieldProps?: FieldRootProps;
	labelProps?: FieldLabelProps;
	loading?: boolean;
};

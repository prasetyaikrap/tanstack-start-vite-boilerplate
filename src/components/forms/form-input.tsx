import { defineStyle, Field, Input, type InputProps } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { BaseFormInputProps } from "./types";

type FormInputProps = {
  inputProps?: InputProps;
  onValueChange?: (value: string) => void;
} & BaseFormInputProps;

export function FormInput({
  id,
  label,
  formProps,
  floatingLabel = false,
  onValueChange,
  inputProps,
  labelProps,
  fieldProps,
}: FormInputProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = formProps;

  const fieldValue = watch(id) as string;
  const [focused, setFocused] = useState(false);
  const shouldFloat = (fieldValue ?? "").length > 0 || focused;

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

  useEffect(() => {
    if (!onValueChange) return;
    onValueChange(fieldValue);
  }, [onValueChange, fieldValue]);

  return (
    <Field.Root invalid={!!errors[id]} {...fieldProps}>
      {!floatingLabel && (
        <Field.Label data-testid={`txt_label-${id}`} {...labelProps}>
          {label} <Field.RequiredIndicator />
        </Field.Label>
      )}
      <Input
        {...register(id)}
        data-float={shouldFloat || undefined}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        data-testid={`input_${id}`}
        {...inputProps}
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

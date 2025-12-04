import {
  defineStyle,
  Field,
  NumberInput,
  type NumberInputValueChangeDetails,
} from "@chakra-ui/react";
import { useState } from "react";
import { type Control, Controller, type FieldValues } from "react-hook-form";
import type { BaseFormInputProps } from "./types";

type FormNumberProps = {
  inputProps?: NumberInput.RootProps;
  onValueChange?: (value: NumberInputValueChangeDetails) => void;
  stepper?: boolean;
} & BaseFormInputProps;

export function FormNumber({
  id,
  label,
  formProps,
  onValueChange,
  stepper = false,
  floatingLabel = false,
  fieldProps,
  inputProps,
  labelProps,
}: FormNumberProps) {
  const {
    watch,
    control,
    formState: { errors },
  } = formProps;

  const fieldValue = watch(id) as number;
  const [focused, setFocused] = useState(false);
  const shouldFloat = (fieldValue ?? 0) > 0 || focused;

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
        name={id}
        control={control as unknown as Control<FieldValues>}
        render={({ field }) => (
          <NumberInput.Root
            disabled={field.disabled}
            name={field.name}
            value={field.value}
            data-float={shouldFloat || undefined}
            onFocus={() => {
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
            }}
            onValueChange={(item) => {
              if (Number.isNaN(item.valueAsNumber)) {
                field.onChange(0);
              } else {
                field.onChange(item.valueAsNumber);
              }
              onValueChange?.(item);
            }}
            w="full"
            {...inputProps}
          >
            {stepper && <NumberInput.Control />}
            <NumberInput.Input
              data-testid={`input_${id}`}
              onBlur={field.onBlur}
            />
          </NumberInput.Root>
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

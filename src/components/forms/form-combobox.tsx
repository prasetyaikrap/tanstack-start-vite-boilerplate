"use client";

import {
  Badge,
  Center,
  Combobox,
  type ComboboxRootProps,
  type ComboboxValueChangeDetails,
  defineStyle,
  Field,
  Flex,
  Span,
  Spinner,
  Stack,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import { type ReactNode, useState } from "react";
import { type Control, Controller, type FieldValues } from "react-hook-form";
import type { BaseSelectOptions } from "@/src/types";
import { PortalWrapper } from "../ui/portal-wrapper";
import type { BaseFormInputProps } from "./types";

type FormComboboxProps = {
  options: BaseSelectOptions[];
  placeholder?: string;
  comboboxProps?: Omit<ComboboxRootProps, "collection" | "name" | "value">;
  onValueChange?: (item: ComboboxValueChangeDetails) => void;
  onInputValueChange?: (props: ComboboxInputValueChangeProps) => void;
  clearable?: boolean;
  portal?: boolean;
  render?: (option: BaseSelectOptions) => ReactNode;
  emptyMessage?: string;
  limit?: number;
  renderResult?: boolean;
} & BaseFormInputProps;

type ComboboxInputValueChangeProps = {
  details: Combobox.InputValueChangeDetails;
  set: (items: BaseSelectOptions[]) => void;
  filter: (inputValue: string) => void;
};

export function FormCombobox({
  id,
  label,
  formProps,
  options,
  floatingLabel,
  placeholder,
  clearable = true,
  portal = true,
  emptyMessage = "Not found",
  loading,
  onInputValueChange,
  onValueChange,
  render,
  limit,
  fieldProps,
  comboboxProps,
  labelProps,
  renderResult = true,
}: FormComboboxProps) {
  const {
    watch,
    formState: { errors },
    control,
  } = formProps;

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter, set } = useListCollection({
    initialItems: options,
    filter: contains,
    limit: limit,
  });

  const isExist = !loading && collection.items.length > 0;

  const isMultiple = Boolean(comboboxProps?.multiple);
  const canRenderMultiResult = isMultiple && renderResult;

  const handleInputChange = (details: Combobox.InputValueChangeDetails) => {
    if (onInputValueChange) {
      return onInputValueChange({ details, set, filter });
    }
    filter(details.inputValue);
  };

  const fieldValue = (watch(id) as BaseSelectOptions[]) || [];
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
        <Field.Label data-testid={`txt_label-${id}`} {...labelProps}>
          {label} <Field.RequiredIndicator />
        </Field.Label>
      )}
      <Controller
        name={id}
        control={control as unknown as Control<FieldValues>}
        render={({ field }) => {
          const fieldValue = (field.value as BaseSelectOptions[]) || [];
          return (
            <Combobox.Root
              collection={collection}
              value={fieldValue.map((v) => v.value)}
              onValueChange={(item) => {
                field.onChange(item.items);
                onValueChange?.(item);
              }}
              onInputValueChange={handleInputChange}
              onInteractOutside={() => field.onBlur()}
              openOnClick
              {...comboboxProps}
            >
              <Combobox.Control>
                <Combobox.Input
                  placeholder={placeholder}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  data-testid={`input_combobox-${id}`}
                />
                <Combobox.IndicatorGroup>
                  {canClear && (
                    <Combobox.ClearTrigger
                      cursor="pointer"
                      data-testid={`btn_combobox-clear-${id}`}
                    />
                  )}
                  {loading && (
                    <Spinner
                      data-testid={`component_combobox-control-spinner-${id}`}
                      size="xs"
                      borderWidth="1.5px"
                      color="fg.muted"
                    />
                  )}
                  <Combobox.Trigger
                    cursor="pointer"
                    data-testid={`btn_combobox-${id}`}
                  />
                </Combobox.IndicatorGroup>
              </Combobox.Control>

              <PortalWrapper portal={portal}>
                <Combobox.Positioner>
                  <Combobox.Content data-testid={`dropdown_combobox-${id}`}>
                    <Combobox.Empty
                      data-testid={`component_combobox-dd-empty-${id}`}
                    >
                      {emptyMessage}
                    </Combobox.Empty>
                    {loading && (
                      <Center py="0.5em">
                        <Spinner
                          size="sm"
                          borderWidth="1.5px"
                          color="fg.muted"
                          data-testid={`component_combobox-dd-spinner${id}`}
                        />
                      </Center>
                    )}
                    {isExist &&
                      collection.items.map((option) => (
                        <Combobox.Item
                          key={option.value}
                          item={option}
                          data-testid={`combobox-option_${id}-${option.value}`}
                          cursor="pointer"
                        >
                          {render ? (
                            render(option)
                          ) : (
                            <DefaultComboboxItemRender option={option} />
                          )}
                          <Combobox.ItemIndicator
                            color="blackAlpha.800"
                            _dark={{ color: "white" }}
                          />
                        </Combobox.Item>
                      ))}
                  </Combobox.Content>
                </Combobox.Positioner>
              </PortalWrapper>
            </Combobox.Root>
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
      {canRenderMultiResult && (
        <Flex w="full" flexWrap="wrap" gap=".5em">
          {fieldValue.map((item) => (
            <Badge
              key={item.value}
              size={comboboxProps?.size}
              colorPalette="teal"
            >
              {item.label}
            </Badge>
          ))}
        </Flex>
      )}
    </Field.Root>
  );
}

type DefaultComboboxItemRenderProps = {
  option: BaseSelectOptions;
};

function DefaultComboboxItemRender({ option }: DefaultComboboxItemRenderProps) {
  return (
    <Stack gap="0">
      <Combobox.ItemText color="blackAlpha.800" _dark={{ color: "white" }}>
        {option.label}
      </Combobox.ItemText>
      <Span color="fg.muted" textStyle="xs">
        {option.description}
      </Span>
    </Stack>
  );
}

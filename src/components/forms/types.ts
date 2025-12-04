import type { FieldLabelProps, FieldRootProps } from "@chakra-ui/react";
import type { UseFormReturn } from "react-hook-form";

export type BaseFormInputProps = {
  id: string;
  label: string;
  formProps: UseFormReturn;
  floatingLabel?: boolean;
  fieldProps?: FieldRootProps;
  labelProps?: FieldLabelProps;
  loading?: boolean;
};

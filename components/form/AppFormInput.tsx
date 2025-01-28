import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export default function AppFormInput<
  T extends FieldValues,
  D extends FieldPath<T>
>({
  type,
  label,
  placeholder,
  inputProps,
  readOnly,
}: {
  type: React.HTMLInputTypeAttribute;
  label: string;
  placeholder?: string;
  inputProps: ControllerRenderProps<T, D>;
  readOnly?: boolean;
}) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          type={type}
          placeholder={placeholder}
          {...inputProps}
          readOnly={readOnly}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

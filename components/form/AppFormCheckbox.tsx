import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Checkbox } from "../ui/checkbox";

export default function AppFormCheckbox<
  T extends FieldValues,
  D extends FieldPath<T>
>({
  label,
  inputProps,
  disabled,
}: {
  type: React.HTMLInputTypeAttribute;
  label: string;
  placeholder?: string;
  inputProps: ControllerRenderProps<T, D>;
  disabled?: boolean;
}) {
  return (
    <FormItem className="space-x-3">
      <FormControl>
        <Checkbox
          checked={inputProps.value}
          disabled={disabled}
          onCheckedChange={inputProps.onChange}
        />
      </FormControl>
      <FormLabel>{label}</FormLabel>
      <FormMessage />
    </FormItem>
  );
}

'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AttributeResponse } from '@sokol111/ecommerce-attribute-service-api';
import { Control, FieldValues, Path } from 'react-hook-form';

interface AttributeInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  fieldName: Path<TFieldValues>;
  attributeDef: AttributeResponse;
  disabled?: boolean;
}

export function AttributeInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  fieldName,
  attributeDef,
  disabled,
}: AttributeInputProps<TFieldValues>) {
  switch (attributeDef.type) {
    case 'single':
      return (
        <SingleSelectInput
          control={control}
          name={`${fieldName}.value` as Path<TFieldValues>}
          options={attributeDef.options}
          disabled={disabled}
        />
      );

    case 'multiple':
      return (
        <MultipleSelectInput
          control={control}
          name={`${fieldName}.values` as Path<TFieldValues>}
          options={attributeDef.options}
          disabled={disabled}
        />
      );

    case 'range':
      return (
        <RangeInput
          control={control}
          name={`${fieldName}.numericValue` as Path<TFieldValues>}
          unit={attributeDef.unit}
          disabled={disabled}
        />
      );

    case 'boolean':
      return (
        <BooleanInput
          control={control}
          name={`${fieldName}.value` as Path<TFieldValues>}
          disabled={disabled}
        />
      );

    case 'text':
      return (
        <TextInput
          control={control}
          name={`${fieldName}.value` as Path<TFieldValues>}
          disabled={disabled}
        />
      );

    default:
      return null;
  }
}

// Single select input
interface SingleSelectInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  options?: AttributeResponse['options'];
  disabled?: boolean;
}

function SingleSelectInput<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  disabled,
}: SingleSelectInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select value..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options
                ?.filter((opt) => opt.enabled)
                .map((opt) => (
                  <SelectItem key={opt.slug} value={opt.value}>
                    {opt.colorCode && (
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: opt.colorCode }}
                      />
                    )}
                    {opt.value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Multiple select (checkboxes) input
interface MultipleSelectInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  options?: AttributeResponse['options'];
  disabled?: boolean;
}

function MultipleSelectInput<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  disabled,
}: MultipleSelectInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValues: string[] = field.value ?? [];
        return (
          <FormItem className="flex-1">
            <div className="flex flex-wrap gap-2">
              {options
                ?.filter((opt) => opt.enabled)
                .map((opt) => {
                  const isChecked = selectedValues.includes(opt.value);
                  return (
                    <label key={opt.slug} className="flex items-center gap-1.5 cursor-pointer">
                      <Checkbox
                        checked={isChecked}
                        disabled={disabled}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...selectedValues, opt.value]);
                          } else {
                            field.onChange(selectedValues.filter((v) => v !== opt.value));
                          }
                        }}
                      />
                      {opt.colorCode && (
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: opt.colorCode }}
                        />
                      )}
                      <span className="text-sm">{opt.value}</span>
                    </label>
                  );
                })}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Range (numeric) input
interface RangeInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  unit?: string;
  disabled?: boolean;
}

function RangeInput<TFieldValues extends FieldValues>({
  control,
  name,
  unit,
  disabled,
}: RangeInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <div className="flex items-center gap-2">
            <FormControl>
              <Input
                type="number"
                step="any"
                disabled={disabled}
                placeholder="Enter value..."
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === '' ? undefined : parseFloat(val));
                }}
              />
            </FormControl>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Boolean input
interface BooleanInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  disabled?: boolean;
}

function BooleanInput<TFieldValues extends FieldValues>({
  control,
  name,
  disabled,
}: BooleanInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Text input
interface TextInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  disabled?: boolean;
}

function TextInput<TFieldValues extends FieldValues>({
  control,
  name,
  disabled,
}: TextInputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormControl>
            <Input
              type="text"
              disabled={disabled}
              placeholder="Enter text..."
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

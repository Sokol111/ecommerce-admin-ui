'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface SwitchFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function SwitchField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
  className,
}: SwitchFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-center gap-2', className)}>
          <FormControl>
            <Switch
              id={name}
              checked={field.value ?? false}
              disabled={disabled}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-0.5">
            <FormLabel htmlFor={name} className="cursor-pointer">
              {label}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

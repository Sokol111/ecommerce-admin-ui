'use client';

import { SwitchField, TextField } from '@/components/form-fields';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2 } from 'lucide-react';
import { Control, UseFormSetValue } from 'react-hook-form';
import { AttributeFormData, generateSlug } from '../_schemas/attribute.schema';

interface AttributeOptionRowProps {
  control: Control<AttributeFormData>;
  index: number;
  fieldId: string;
  showColorCode: boolean;
  disabled?: boolean;
  onRemove: () => void;
  setValue: UseFormSetValue<AttributeFormData>;
}

export function AttributeOptionRow({
  control,
  index,
  fieldId,
  showColorCode,
  disabled,
  onRemove,
  setValue,
}: AttributeOptionRowProps) {
  const handleValueChange = (value: string) => {
    setValue(`options.${index}.slug`, generateSlug(value));
  };

  return (
    <div key={fieldId} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center pt-8 text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
        <FormField
          control={control}
          name={`options.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="e.g., Red"
                  disabled={disabled}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleValueChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <TextField
          control={control}
          name={`options.${index}.slug`}
          label="Slug"
          placeholder="e.g., red"
          disabled={disabled}
        />

        {showColorCode && (
          <FormField
            control={control}
            name={`options.${index}.colorCode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color Code</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input type="text" placeholder="#FF0000" disabled={disabled} {...field} />
                    {field.value && /^#[0-9A-Fa-f]{6}$/.test(field.value) && (
                      <div
                        className="w-9 h-9 rounded border shrink-0"
                        style={{ backgroundColor: field.value }}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex items-end gap-2">
          <SwitchField
            control={control}
            name={`options.${index}.enabled`}
            label="Enabled"
            disabled={disabled}
            className="pb-2"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-8 text-destructive hover:text-destructive"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

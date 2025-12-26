'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface ImageFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  disabled?: boolean;
  previewUrl?: string;
  error?: string;
  originalImageId?: string;
  onFileChange: (files: FileList | null) => void;
  accept?: string;
  className?: string;
}

export function ImageField<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  disabled,
  previewUrl,
  error,
  originalImageId,
  onFileChange,
  accept = 'image/jpeg,image/png,image/webp,image/avif',
  className,
}: ImageFieldProps<TFieldValues>) {
  const inputId = `${name}-input`;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const hasImage = !!field.value;
        const isOriginalImage = field.value === originalImageId;
        const fileName = !field.value
          ? 'No file chosen'
          : isOriginalImage
            ? `Current image: ${field.value}`
            : 'New image selected';

        return (
          <FormItem className={className}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Button type="button" asChild>
                  <label htmlFor={inputId} className="cursor-pointer">
                    {hasImage ? 'Replace Image' : 'Choose File'}
                  </label>
                </Button>
                <span className="text-sm text-muted-foreground">{fileName}</span>
                <Input
                  id={inputId}
                  type="file"
                  accept={accept}
                  disabled={disabled}
                  onChange={(e) => onFileChange(e.target.files)}
                  className="hidden"
                />
              </div>
            </FormControl>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <FormMessage />
            {previewUrl && (
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  width={480}
                  height={360}
                  className="rounded border"
                />
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
}

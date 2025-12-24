'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createAttributeAction, updateAttributeAction } from '@/lib/actions';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AttributeOptionInput,
  AttributeResponse,
  CreateAttributeBodyType,
} from '@sokol111/ecommerce-attribute-service-api';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const ATTRIBUTE_TYPES = [
  { value: 'select', label: 'Select (single choice)' },
  { value: 'multiselect', label: 'Multiselect (multiple choices)' },
  { value: 'range', label: 'Range (numeric)' },
  { value: 'boolean', label: 'Boolean (yes/no)' },
  { value: 'text', label: 'Text (free input)' },
] as const;

const attributeOptionSchema = z.object({
  value: z.string().min(1, 'Value is required').max(100, 'Value must be at most 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color code')
    .optional()
    .or(z.literal('')),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  enabled: z.boolean(),
});

const attributeSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(0),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((s) => s.trim()),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  type: z.enum(['select', 'multiselect', 'range', 'boolean', 'text']),
  unit: z.string().max(20, 'Unit must be at most 20 characters').optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  enabled: z.boolean(),
  options: z.array(attributeOptionSchema).optional(),
});

export type AttributeFormData = z.infer<typeof attributeSchema>;

interface AttributeEditProps {
  attribute?: AttributeResponse;
}

export default function AttributeEdit({ attribute }: AttributeEditProps) {
  const router = useRouter();
  const isEditMode = !!attribute;

  const [saving, setSaving] = useState(false);

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: isEditMode
      ? {
          id: attribute.id,
          version: attribute.version,
          name: attribute.name,
          slug: attribute.slug,
          type: attribute.type,
          unit: attribute.unit ?? '',
          sortOrder: attribute.sortOrder,
          enabled: attribute.enabled,
          options:
            attribute.options?.map((opt) => ({
              value: opt.value,
              slug: opt.slug,
              colorCode: opt.colorCode ?? '',
              sortOrder: opt.sortOrder,
              enabled: opt.enabled,
            })) ?? [],
        }
      : {
          id: uuidv4(),
          version: 0,
          name: '',
          slug: '',
          type: 'select',
          unit: '',
          sortOrder: 0,
          enabled: true,
          options: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const watchType = form.watch('type');
  const showOptions = watchType === 'select' || watchType === 'multiselect';
  const showUnit = watchType === 'range';
  const showColorCode = watchType === 'select' || watchType === 'multiselect';

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    if (!isEditMode || !form.getValues('slug')) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      form.setValue('slug', slug);
    }
  };

  const addOption = () => {
    append({
      value: '',
      slug: '',
      colorCode: '',
      sortOrder: fields.length,
      enabled: true,
    });
  };

  async function onSubmit(value: AttributeFormData) {
    setSaving(true);
    try {
      // Prepare options - filter out empty colorCode
      const options: AttributeOptionInput[] | undefined = showOptions
        ? value.options?.map((opt) => ({
            value: opt.value,
            slug: opt.slug,
            colorCode: opt.colorCode || undefined,
            sortOrder: opt.sortOrder,
            enabled: opt.enabled,
          }))
        : undefined;

      let result;
      if (isEditMode) {
        result = await updateAttributeAction({
          id: value.id,
          version: value.version,
          name: value.name,
          slug: value.slug,
          type: value.type as CreateAttributeBodyType,
          unit: showUnit ? value.unit || undefined : undefined,
          sortOrder: value.sortOrder,
          enabled: value.enabled,
          options,
        });
      } else {
        result = await createAttributeAction({
          id: value.id,
          name: value.name,
          slug: value.slug,
          type: value.type as CreateAttributeBodyType,
          unit: showUnit ? value.unit || undefined : undefined,
          sortOrder: value.sortOrder,
          enabled: value.enabled,
          options,
        });
      }

      if (!result.success) {
        const { error } = result;
        if (error.fields) {
          Object.entries(error.fields).forEach(([field, message]) => {
            form.setError(field as keyof AttributeFormData, { message });
          });
        }
        toast.error(error.title, {
          description: problemToDescription(error),
        });
        return;
      }

      toast.success(
        isEditMode ? 'Attribute updated successfully' : 'Attribute created successfully'
      );
      router.push('/attribute/list');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Unexpected error', {
        description: `Something went wrong while ${isEditMode ? 'updating' : 'creating'} the attribute: ${errorMessage}`,
      });
    } finally {
      setSaving(false);
    }
  }

  const isBusy = saving;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...form.register('id')} />
        <input type="hidden" {...form.register('version')} />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., Color, Size, Memory"
                        disabled={isBusy}
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., color, size, memory"
                        disabled={isBusy}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>URL-friendly identifier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isBusy || isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select attribute type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ATTRIBUTE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isEditMode && (
                      <FormDescription>Type cannot be changed after creation</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10000}
                        disabled={isBusy}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showUnit && (
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., GB, kg, cm"
                        disabled={isBusy}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Unit of measurement for range type</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        disabled={isBusy}
                        onCheckedChange={(v) => field.onChange(v === true)}
                      />
                    </FormControl>
                    <FormLabel className="mt-0!">Enabled</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options (for select/multiselect types) */}
        {showOptions && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Options
                <Badge variant="secondary" className="ml-2">
                  {fields.length}
                </Badge>
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={isBusy}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No options added yet. Click &quot;Add Option&quot; to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center pt-8 text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <FormField
                          control={form.control}
                          name={`options.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="e.g., Red"
                                  disabled={isBusy}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    // Auto-generate slug for option
                                    const slug = e.target.value
                                      .toLowerCase()
                                      .trim()
                                      .replace(/[^a-z0-9\s-]/g, '')
                                      .replace(/\s+/g, '-');
                                    form.setValue(`options.${index}.slug`, slug);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`options.${index}.slug`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slug</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="e.g., red"
                                  disabled={isBusy}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {showColorCode && (
                          <FormField
                            control={form.control}
                            name={`options.${index}.colorCode`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Color Code</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      placeholder="#FF0000"
                                      disabled={isBusy}
                                      {...field}
                                    />
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
                          <FormField
                            control={form.control}
                            name={`options.${index}.enabled`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2 pb-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    disabled={isBusy}
                                    onCheckedChange={(v) => field.onChange(v === true)}
                                  />
                                </FormControl>
                                <FormLabel className="mt-0!">Enabled</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-8 text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isBusy}>
            {isBusy ? 'Saving...' : isEditMode ? 'Update Attribute' : 'Create Attribute'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/attribute/list')}
            disabled={isBusy}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

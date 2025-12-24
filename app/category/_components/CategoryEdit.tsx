'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
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
import { createCategoryAction, updateCategoryAction } from '@/lib/actions';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { AttributeResponse } from '@sokol111/ecommerce-attribute-service-api';
import { CategoryAttributeInput, CategoryResponse } from '@sokol111/ecommerce-category-service-api';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Schema for category attribute
const categoryAttributeSchema = z.object({
  attributeId: z.string().uuid('Please select an attribute'),
  required: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
  filterable: z.boolean(),
  searchable: z.boolean(),
  enabled: z.boolean(),
});

// Schema for category form
const categorySchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(0, 'Version is required'),
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be at most 50 characters')
    .regex(/^[A-Za-z0-9 _-]+$/, 'Only letters, numbers, space, underscore and dash allowed')
    .transform((s) => s.trim()),
  enabled: z.boolean(),
  attributes: z.array(categoryAttributeSchema),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryEditProps {
  category?: CategoryResponse;
  availableAttributes: AttributeResponse[];
}

export default function CategoryEdit({ category, availableAttributes }: CategoryEditProps) {
  const router = useRouter();
  const isEditMode = !!category;

  const [saving, setSaving] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: isEditMode
      ? {
          id: category.id,
          version: category.version,
          name: category.name,
          enabled: category.enabled,
          attributes:
            category.attributes?.map((attr) => ({
              attributeId: attr.attributeId,
              required: attr.required,
              sortOrder: attr.sortOrder,
              filterable: attr.filterable,
              searchable: attr.searchable,
              enabled: attr.enabled,
            })) ?? [],
        }
      : {
          id: uuidv4(),
          version: 0,
          name: '',
          enabled: false,
          attributes: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attributes',
  });

  const watchedAttributes = form.watch('attributes');
  const usedAttributeIds = new Set(watchedAttributes?.map((a) => a.attributeId) ?? []);
  const availableToAdd = availableAttributes.filter((a) => !usedAttributeIds.has(a.id));

  const addAttribute = () => {
    if (availableToAdd.length === 0) return;
    append({
      attributeId: '',
      required: false,
      sortOrder: fields.length,
      filterable: false,
      searchable: false,
      enabled: true,
    });
  };

  const getAttributeName = (attributeId: string) => {
    const attr = availableAttributes.find((a) => a.id === attributeId);
    return attr?.name ?? attributeId;
  };

  async function onSubmit(value: CategoryFormData) {
    setSaving(true);
    try {
      // Prepare attributes for API
      const attributes: CategoryAttributeInput[] | undefined =
        value.attributes.length > 0
          ? value.attributes.map((attr) => ({
              attributeId: attr.attributeId,
              required: attr.required,
              sortOrder: attr.sortOrder,
              filterable: attr.filterable,
              searchable: attr.searchable,
              enabled: attr.enabled,
            }))
          : undefined;

      let result;
      if (isEditMode) {
        result = await updateCategoryAction({
          id: value.id,
          version: value.version,
          name: value.name,
          enabled: value.enabled,
          attributes,
        });
      } else {
        result = await createCategoryAction({
          name: value.name,
          enabled: value.enabled,
          attributes,
        });
      }

      if (!result.success) {
        const { error } = result;

        // Show field-level validation errors if present
        if (error.fields) {
          Object.entries(error.fields).forEach(([field, message]) => {
            if (field === 'id' || field === 'version' || field === 'name' || field === 'enabled') {
              form.setError(field, { message });
            }
          });
        }

        toast.error(error.title, {
          description: problemToDescription(error),
        });
        return;
      }

      toast.success(isEditMode ? 'Category updated successfully' : 'Category created successfully');
      router.push('/category/list');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Unexpected error', {
        description: `Something went wrong while ${isEditMode ? 'updating' : 'creating'} the category: ${errorMessage}`,
      });
    } finally {
      setSaving(false);
    }
  }

  const isBusy = saving;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        aria-busy={isBusy ? 'true' : undefined}
      >
        <input type="hidden" {...form.register('id')} />
        <input type="hidden" {...form.register('version')} />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={'name'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category name</FormLabel>
                  <FormControl>
                    <Input type="text" disabled={isBusy} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'enabled'}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Switch
                      id="enabled"
                      checked={field.value}
                      disabled={isBusy}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel htmlFor="enabled">Enabled</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Attributes Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Attributes
              <Badge variant="secondary" className="ml-2">
                {fields.length}
              </Badge>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttribute}
              disabled={isBusy || availableToAdd.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Attribute
            </Button>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No attributes assigned yet. Click &quot;Add Attribute&quot; to assign one.
              </p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const currentAttributeId = watchedAttributes?.[index]?.attributeId;
                  const selectableAttributes = availableAttributes.filter(
                    (a) => a.id === currentAttributeId || !usedAttributeIds.has(a.id)
                  );

                  return (
                    <div
                      key={field.id}
                      className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`attributes.${index}.attributeId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Attribute</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={isBusy}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select an attribute">
                                        {field.value
                                          ? getAttributeName(field.value)
                                          : 'Select an attribute'}
                                      </SelectValue>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectableAttributes.map((attr) => (
                                      <SelectItem key={attr.id} value={attr.id}>
                                        {attr.name} ({attr.type})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`attributes.${index}.sortOrder`}
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

                        <div className="flex flex-wrap gap-6">
                          <FormField
                            control={form.control}
                            name={`attributes.${index}.required`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    disabled={isBusy}
                                    onCheckedChange={(v) => field.onChange(v === true)}
                                  />
                                </FormControl>
                                <FormLabel className="mt-0!">Required</FormLabel>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`attributes.${index}.filterable`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    disabled={isBusy}
                                    onCheckedChange={(v) => field.onChange(v === true)}
                                  />
                                </FormControl>
                                <FormLabel className="mt-0!">Filterable</FormLabel>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`attributes.${index}.searchable`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    disabled={isBusy}
                                    onCheckedChange={(v) => field.onChange(v === true)}
                                  />
                                </FormControl>
                                <FormLabel className="mt-0!">Searchable</FormLabel>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`attributes.${index}.enabled`}
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isBusy}>
            {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/category/list')}
            disabled={isBusy}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

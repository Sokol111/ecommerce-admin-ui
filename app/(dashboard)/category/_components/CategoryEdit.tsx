'use client';

import { SwitchField, TextField } from '@/components/form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AttributeResponse,
  CategoryAttributeInput,
  CategoryResponse,
} from '@sokol111/ecommerce-catalog-service-api';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { CategoryFormData, categorySchema } from '../_schemas/category.schema';
import { createCategoryAction, updateCategoryAction } from '../actions';
import { CategoryAttributeRow } from './CategoryAttributeRow';

export type { CategoryFormData } from '../_schemas/category.schema';

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
              role: attr.role,
              required: attr.required,
              sortOrder: attr.sortOrder,
              filterable: attr.filterable,
              searchable: attr.searchable,
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
      role: 'specification',
      required: false,
      sortOrder: fields.length,
      filterable: false,
      searchable: false,
    });
  };

  const getAttributeType = (attributeId: string) =>
    availableAttributes.find((a) => a.id === attributeId)?.type;

  const isBusy = saving;

  async function onSubmit(value: CategoryFormData) {
    setSaving(true);
    try {
      const attributes: CategoryAttributeInput[] | undefined =
        value.attributes.length > 0
          ? value.attributes.map((attr) => ({
              attributeId: attr.attributeId,
              role: attr.role,
              required: attr.required,
              sortOrder: attr.sortOrder,
              filterable: attr.filterable,
              searchable: attr.searchable,
            }))
          : undefined;

      const result = isEditMode
        ? await updateCategoryAction({
            id: value.id,
            version: value.version,
            name: value.name,
            enabled: value.enabled,
            attributes,
          })
        : await createCategoryAction({
            name: value.name,
            enabled: value.enabled,
            attributes,
          });

      if (!result.success) {
        const { error } = result;
        if (error.fields) {
          Object.entries(error.fields).forEach(([field, message]) => {
            if (field === 'id' || field === 'version' || field === 'name' || field === 'enabled') {
              form.setError(field, { message });
            }
          });
        }
        toast.error(error.title, { description: problemToDescription(error) });
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        aria-busy={isBusy || undefined}
      >
        <input type="hidden" {...form.register('id')} />
        <input type="hidden" {...form.register('version')} />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField control={form.control} name="name" label="Category name" disabled={isBusy} />
            <SwitchField control={form.control} name="enabled" label="Enabled" disabled={isBusy} />
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
                    <CategoryAttributeRow
                      key={field.id}
                      control={form.control}
                      index={index}
                      fieldId={field.id}
                      selectableAttributes={selectableAttributes}
                      currentAttributeId={currentAttributeId}
                      currentRole={watchedAttributes?.[index]?.role}
                      disabled={isBusy}
                      onRemove={() => remove(index)}
                      getAttributeType={getAttributeType}
                    />
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

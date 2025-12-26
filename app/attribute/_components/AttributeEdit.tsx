'use client';

import { NumberField, SelectField, SwitchField, TextField } from '@/components/form-fields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormDescription } from '@/components/ui/form';
import { createAttributeAction, updateAttributeAction } from '@/lib/actions';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AttributeOptionInput,
  AttributeResponse,
  CreateAttributeBodyType,
} from '@sokol111/ecommerce-attribute-service-api';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import {
  ATTRIBUTE_TYPES,
  AttributeFormData,
  attributeSchema,
  generateSlug,
} from '../_schemas/attribute.schema';
import { AttributeOptionRow } from './AttributeOptionRow';

export type { AttributeFormData } from '../_schemas/attribute.schema';

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
          type: 'single',
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
  const showOptions = watchType === 'single' || watchType === 'multiple';
  const showUnit = watchType === 'range';
  const showColorCode = watchType === 'single' || watchType === 'multiple';

  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    if (!isEditMode || !form.getValues('slug')) {
      form.setValue('slug', generateSlug(value));
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

  const isBusy = saving;

  async function onSubmit(value: AttributeFormData) {
    setSaving(true);
    try {
      const options: AttributeOptionInput[] | undefined = showOptions
        ? value.options?.map((opt) => ({
            value: opt.value,
            slug: opt.slug,
            colorCode: opt.colorCode || undefined,
            sortOrder: opt.sortOrder,
            enabled: opt.enabled,
          }))
        : undefined;

      const payload = {
        id: value.id,
        name: value.name,
        slug: value.slug,
        type: value.type as CreateAttributeBodyType,
        unit: showUnit ? value.unit || undefined : undefined,
        sortOrder: value.sortOrder,
        enabled: value.enabled,
        options,
      };

      const result = isEditMode
        ? await updateAttributeAction({ ...payload, version: value.version })
        : await createAttributeAction(payload);

      if (!result.success) {
        const { error } = result;
        if (error.fields) {
          Object.entries(error.fields).forEach(([field, message]) => {
            form.setError(field as keyof AttributeFormData, { message });
          });
        }
        toast.error(error.title, { description: problemToDescription(error) });
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

  const typeOptions = ATTRIBUTE_TYPES.map((t) => ({ value: t.value, label: t.label }));

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
              <TextField
                control={form.control}
                name="name"
                label="Name"
                placeholder="e.g., Color, Size, Memory"
                disabled={isBusy}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              <div>
                <TextField
                  control={form.control}
                  name="slug"
                  label="Slug"
                  placeholder="e.g., color, size, memory"
                  disabled={isBusy}
                />
                <FormDescription className="mt-1">URL-friendly identifier</FormDescription>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SelectField
                  control={form.control}
                  name="type"
                  label="Type"
                  options={typeOptions}
                  placeholder="Select attribute type"
                  disabled={isBusy || isEditMode}
                />
                {isEditMode && (
                  <FormDescription className="mt-1">
                    Type cannot be changed after creation
                  </FormDescription>
                )}
              </div>

              <NumberField
                control={form.control}
                name="sortOrder"
                label="Sort Order"
                min={0}
                max={10000}
                disabled={isBusy}
              />
            </div>

            {showUnit && (
              <div>
                <TextField
                  control={form.control}
                  name="unit"
                  label="Unit"
                  placeholder="e.g., GB, kg, cm"
                  disabled={isBusy}
                />
                <FormDescription className="mt-1">
                  Unit of measurement for range type
                </FormDescription>
              </div>
            )}

            <SwitchField control={form.control} name="enabled" label="Enabled" disabled={isBusy} />
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
                    <AttributeOptionRow
                      key={field.id}
                      control={form.control}
                      index={index}
                      fieldId={field.id}
                      showColorCode={showColorCode}
                      disabled={isBusy}
                      onRemove={() => remove(index)}
                      setValue={form.setValue}
                    />
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

'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { createCategoryAction, updateCategoryAction } from '@/lib/actions';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryResponse } from '@sokol111/ecommerce-category-service-api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

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
});

export type CategoryFormData = z.infer<typeof categorySchema>;

interface AppCategoryEditProps {
  category?: CategoryResponse;
}

export default function AppCategoryEdit({ category }: AppCategoryEditProps) {
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
        }
      : {
          id: uuidv4(),
          version: 0,
          name: '',
          enabled: false,
        },
  });

  async function onSubmit(value: CategoryFormData) {
    setSaving(true);
    try {
      let result;
      if (isEditMode) {
        result = await updateCategoryAction({
          id: value.id,
          version: value.version,
          name: value.name,
          enabled: value.enabled,
        });
      } else {
        result = await createCategoryAction({
          name: value.name,
          enabled: value.enabled,
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
        className="space-y-8"
        aria-busy={isBusy ? 'true' : undefined}
      >
        <input type="hidden" {...form.register('id')} />
        <input type="hidden" {...form.register('version')} />
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
                <Checkbox
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
        <Button type="submit" disabled={isBusy}>
          {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
